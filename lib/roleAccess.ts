import type { ProjectItem } from "@/store/leadFlowStore";
import type { ConstructionSite } from "@/store/siteStore";
import type { JobItem, AwardedContractor, JobRFI, JobVariation } from "@/store/tenderFlowStore";

export interface CurrentUserRef {
  id?: number | string;
  name?: string;
  role?: string;
  email?: string;
}

export const isSiteManager = (user?: CurrentUserRef | null): boolean => {
  return user?.role === "SITE_MANAGER";
};

export const isFieldWorker = (user?: CurrentUserRef | null): boolean => {
  return user?.role === "FIELD_WORKER";
};

export const isAdminOrOwner = (user?: CurrentUserRef | null): boolean => {
  return user?.role === "OWNER" || user?.role === "ACCOUNT_ADMIN";
};

export const isProjectManager = (user?: CurrentUserRef | null): boolean => {
  return user?.role === "PROJECT_MANAGER";
};

export const isFinanceManager = (user?: CurrentUserRef | null): boolean => {
  return user?.role === "FINANCE_MANAGER";
};

/**
 * Normalizes user and manager strings for robust comparison:
 * - Lowers case
 * - Trims whitespace
 * - Strips common role suffixes like _sm, -sm, (sm), (site manager), _sitemanager, sm
 * - Replaces separators (underscore, hyphen, dot) with spaces
 */
export const normalizeManagerName = (name?: string): string => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[(_-]?(site[\s_-]?manager|sm)[)]?/gi, "")
    .replace(/[._-]/g, " ")
    .trim();
};

export const isManagerMatch = (
  candidateName?: string,
  candidateId?: string | number,
  user?: CurrentUserRef | null
): boolean => {
  if (!user) return true;
  if (!candidateName && !candidateId) return false;

  const rawUserName = (user.name || "").trim().toLowerCase();
  const rawCandidateName = (candidateName || "").trim().toLowerCase();
  const userId = String(user.id || "").trim().toLowerCase();
  const candId = String(candidateId || "").trim().toLowerCase();

  // 1. If assigned to generic "Site Manager" or default SM ID and current user is a Site Manager
  if (user.role === "SITE_MANAGER") {
    if (
      rawCandidateName === "site manager" ||
      rawCandidateName === "site_manager" ||
      rawCandidateName === "default site manager" ||
      candId === "user-default-sm" ||
      candId === "sm-default"
    ) {
      return true;
    }
  }

  // 2. Direct name or ID exact match
  if (rawCandidateName && rawUserName && rawCandidateName === rawUserName) {
    return true;
  }
  if (candId && userId) {
    if (
      candId === userId ||
      candId === `user-${userId}` ||
      userId === `user-${candId}` ||
      candId === `crew-${userId}` ||
      userId === `crew-${candId}`
    ) {
      return true;
    }
  }

  // 3. User email match
  if (user.email) {
    const userEmail = user.email.toLowerCase().trim();
    const emailPrefix = userEmail.split("@")[0].trim();
    if (rawCandidateName === userEmail || rawCandidateName === emailPrefix) {
      return true;
    }
    const candNorm = normalizeManagerName(rawCandidateName);
    const emailNorm = normalizeManagerName(emailPrefix);
    if (
      candNorm &&
      emailNorm &&
      (candNorm === emailNorm || candNorm.includes(emailNorm) || emailNorm.includes(candNorm))
    ) {
      return true;
    }
  }

  // 4. Normalized name match (e.g. "MUKESH_SM" matches "Mukesh", "Mukesh Kumar", "Mukesh SM")
  const normUser = normalizeManagerName(rawUserName);
  const normCandidate = normalizeManagerName(rawCandidateName);

  if (normUser && normCandidate) {
    if (normUser === normCandidate) return true;
    if (normCandidate.includes(normUser) || normUser.includes(normCandidate)) return true;
  }

  // 5. Substring fallback on raw names
  if (rawCandidateName && rawUserName) {
    if (rawUserName.includes(rawCandidateName) || rawCandidateName.includes(rawUserName)) {
      return true;
    }
  }

  return false;
};

export const isProjectNameMatch = (nameA?: string, nameB?: string): boolean => {
  if (!nameA || !nameB) return false;
  const a = nameA.trim().toLowerCase();
  const b = nameB.trim().toLowerCase();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const cleanA = a
    .replace(/[•\-_].*$/, "")
    .replace(/\s*(site|project|yard|tower|phase\s*\d*)$/i, "")
    .trim();
  const cleanB = b
    .replace(/[•\-_].*$/, "")
    .replace(/\s*(site|project|yard|tower|phase\s*\d*)$/i, "")
    .trim();
  if (cleanA && cleanB && (cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA))) {
    return true;
  }
  return false;
};

/**
 * Checks whether a given project is assigned to the current user.
 */
export const isProjectAssignedToUser = (
  project: ProjectItem,
  sites: ConstructionSite[] = [],
  user?: CurrentUserRef | null
): boolean => {
  if (!user) return true; // Default fallback if no auth

  // Owners, Account Admins, and Finance Managers have full company-wide visibility
  if (isAdminOrOwner(user) || isFinanceManager(user)) {
    return true;
  }

  // Project Managers see projects they lead, or default to all if none explicitly filtered
  if (isProjectManager(user)) {
    if (!project.lead) return true;
    return (
      isManagerMatch(project.lead, undefined, user) ||
      project.lead.trim().toLowerCase() === "project lead" ||
      project.lead.trim().toLowerCase() === "project manager"
    );
  }

  // Site Manager: ONLY assigned projects
  if (isSiteManager(user)) {
    // 1. Explicit siteManagerName or ID on project
    if (isManagerMatch(project.siteManagerName, project.siteManagerId, user)) {
      return true;
    }

    // 2. Project lead matches this Site Manager
    if (isManagerMatch(project.lead, undefined, user)) {
      return true;
    }

    // 3. Any construction site matching this project assigned to this Site Manager
    const matchingSite = sites.find((s) => {
      const nameMatch =
        isProjectNameMatch(s.projectName, project.name) ||
        isProjectNameMatch(s.name, project.name);
      if (!nameMatch) return false;

      return isManagerMatch(s.siteManagerName, s.siteManagerId, user);
    });

    if (matchingSite) return true;

    // 4. Fallback: if project is assigned to generic "Site Manager" or has no specific conflicting manager
    const pMgr = (project.siteManagerName || "").trim().toLowerCase();
    if (!pMgr || pMgr === "site manager" || pMgr === "unassigned") {
      return true;
    }

    return false;
  }

  // Field Workers don't manage projects directly
  if (isFieldWorker(user)) {
    return false;
  }

  return true;
};

/**
 * Filter list of projects assigned to the current user.
 */
export const getAssignedProjects = (
  projects: ProjectItem[] = [],
  sites: ConstructionSite[] = [],
  user?: CurrentUserRef | null
): ProjectItem[] => {
  if (!user || isAdminOrOwner(user) || isFinanceManager(user)) {
    const all = [...projects];
    sites.forEach((s) => {
      const pName = s.projectName || s.name;
      if (pName && !all.some((p) => isProjectNameMatch(p.name, pName))) {
        all.push({
          id: `PRJ-${s.id.replace(/[^a-zA-Z0-9]/g, "") || Math.floor(100 + Math.random() * 900)}`,
          name: pName,
          location: `${s.city || ""}, ${s.state || ""}`.replace(/^,\s*|,\s*$/g, "") || s.address || "Project Site",
          client: s.projectName || "Client Project",
          budget: "₹50,00,000",
          progress: s.status === "Completed" ? 100 : 35,
          status: s.status === "Completed" ? "COMPLETED" : "IN_PROGRESS",
          lead: "Project Manager",
          due: s.expectedCompletion || "Ongoing",
          siteManagerId: s.siteManagerId,
          siteManagerName: s.siteManagerName,
        });
      }
    });
    return all;
  }

  // Filter existing projects
  const matchedProjects = projects.filter((p) => isProjectAssignedToUser(p, sites, user));
  const result = [...matchedProjects];

  // Synthesize/ensure projects exist for any assigned sites that don't have a project in `projects`
  if (isSiteManager(user)) {
    sites.forEach((s) => {
      const isSiteAssigned =
        isManagerMatch(s.siteManagerName, s.siteManagerId, user) ||
        !s.siteManagerName ||
        s.siteManagerName.toLowerCase() === "site manager" ||
        s.siteManagerName.toLowerCase() === "unassigned";

      if (isSiteAssigned) {
        const pName = s.projectName || s.name;
        if (pName && !result.some((p) => isProjectNameMatch(p.name, pName))) {
          result.push({
            id: `PRJ-${s.id.replace(/[^a-zA-Z0-9]/g, "") || Math.floor(100 + Math.random() * 900)}`,
            name: pName,
            location: `${s.city || ""}, ${s.state || ""}`.replace(/^,\s*|,\s*$/g, "") || s.address || "Project Site",
            client: s.projectName || "Client Project",
            budget: "₹50,00,000",
            progress: s.status === "Completed" ? 100 : 35,
            status: s.status === "Completed" ? "COMPLETED" : "IN_PROGRESS",
            lead: "Project Manager",
            due: s.expectedCompletion || "Ongoing",
            siteManagerId: s.siteManagerId || (user.id ? `user-${user.id}` : undefined),
            siteManagerName: s.siteManagerName || user.name || "Site Manager",
          });
        }
      }
    });
  }

  return result;
};

/**
 * Filter list of construction sites assigned to the current user.
 */
export const getAssignedSites = (
  sites: ConstructionSite[] = [],
  user?: CurrentUserRef | null,
  assignedProjects: ProjectItem[] = []
): ConstructionSite[] => {
  if (!user || isAdminOrOwner(user) || isProjectManager(user) || isFinanceManager(user)) {
    return sites;
  }

  if (isSiteManager(user)) {
    // 1. Direct site matches or matches via project name
    const matchedSites = sites.filter((site) => {
      const directMatch = isManagerMatch(site.siteManagerName, site.siteManagerId, user);
      if (directMatch) return true;

      // Match by assigned project name
      const siteProject = (site.projectName || "").trim();
      const siteName = (site.name || "").trim();
      const matchesAssignedProject = assignedProjects.some((p) => {
        return (
          isProjectNameMatch(p.name, siteProject) ||
          isProjectNameMatch(p.name, siteName)
        );
      });

      if (matchesAssignedProject) return true;

      // Fallback for default site manager
      if (
        !site.siteManagerName ||
        site.siteManagerName.toLowerCase() === "site manager" ||
        site.siteManagerName.toLowerCase() === "unassigned"
      ) {
        return true;
      }

      return false;
    });

    // 2. Synthesize/ensure each assigned project has a visible site representation
    // if no explicit site in `sites` matches it yet
    const result = [...matchedSites];
    assignedProjects.forEach((proj) => {
      const hasSite = result.some((s) => {
        return (
          isProjectNameMatch(s.projectName, proj.name) ||
          isProjectNameMatch(s.name, proj.name)
        );
      });

      if (!hasSite) {
        result.push({
          id: `SITE-${proj.id}`,
          name: `${proj.name} • Main Site Yard`,
          projectName: proj.name,
          address: proj.location || "Active Construction Site Address",
          city: proj.location?.includes(",") ? proj.location.split(",")[0].trim() : "Gurugram",
          state: proj.location?.includes(",") ? proj.location.split(",")[1]?.trim() || "Haryana" : "Haryana",
          pincode: "122001",
          siteManagerId: user.id ? `user-${user.id}` : undefined,
          siteManagerName: user.name || "Site Manager",
          status: "Active",
          startDate: "15 Sep 2026",
          expectedCompletion: proj.due || "31 Dec 2026",
          totalAreaSqFt: "65,000 sq.ft",
          createdAt: new Date().toISOString().split("T")[0],
        });
      }
    });

    return result;
  }

  return sites;
};

/**
 * Checks whether a given job is assigned to the current user.
 */
export const isJobAssignedToUser = (
  job: JobItem,
  assignedProjects: ProjectItem[] = [],
  assignedSites: ConstructionSite[] = [],
  user?: CurrentUserRef | null
): boolean => {
  if (!user) return true;

  if (isAdminOrOwner(user) || isProjectManager(user) || isFinanceManager(user)) {
    return true;
  }

  // Field Worker: only jobs assigned to this specific worker
  if (isFieldWorker(user)) {
    const assignee = (job.assignee || "").trim().toLowerCase();
    const userName = (user.name || "").trim().toLowerCase();
    if (!assignee || !userName) return false;
    return isManagerMatch(job.assignee, undefined, user);
  }

  // Site Manager
  if (isSiteManager(user)) {
    // 1. Direct SM tag on job
    if (isManagerMatch(job.siteManagerName, job.siteManagerId, user)) {
      return true;
    }

    // 2. SM directly assigned as assignee
    if (isManagerMatch(job.assignee, undefined, user)) {
      return true;
    }

    // 3. Job project matches one of this SM's assigned projects
    const jobProject = (job.projectName || "").trim();
    const matchesProject = assignedProjects.some((p) =>
      isProjectNameMatch(p.name, jobProject)
    );
    if (matchesProject) return true;

    // 4. Job project or location matches one of this SM's assigned sites
    const jobLocation = (job.location || "").trim();
    const matchesSite = assignedSites.some((s) => {
      return (
        isProjectNameMatch(s.projectName, jobProject) ||
        isProjectNameMatch(s.name, jobProject) ||
        isProjectNameMatch(s.name, jobLocation) ||
        isProjectNameMatch(s.address, jobLocation)
      );
    });

    if (matchesSite) return true;

    // 5. If job has generic "Site Manager" or unassigned
    if (!job.siteManagerName || job.siteManagerName.trim().toLowerCase() === "site manager") {
      return true;
    }
  }

  return true;
};

/**
 * Filter list of jobs assigned to the current user.
 */
export const getAssignedJobs = (
  jobs: JobItem[] = [],
  assignedProjects: ProjectItem[] = [],
  assignedSites: ConstructionSite[] = [],
  user?: CurrentUserRef | null
): JobItem[] => {
  if (!user || isAdminOrOwner(user) || isProjectManager(user) || isFinanceManager(user)) {
    return jobs;
  }
  return jobs.filter((j) =>
    isJobAssignedToUser(j, assignedProjects, assignedSites, user)
  );
};

/**
 * Filter awarded contractors whose project belongs to the current user's scope.
 */
export const getAssignedContractors = (
  contractors: AwardedContractor[] = [],
  assignedProjects: ProjectItem[] = [],
  assignedSites: ConstructionSite[] = [],
  user?: CurrentUserRef | null
): AwardedContractor[] => {
  if (!user || isAdminOrOwner(user) || isProjectManager(user)) {
    return contractors;
  }

  if (isSiteManager(user)) {
    return contractors.filter((c) => {
      const cProj = (c.projectName || "").trim().toLowerCase();
      const matchesProject = assignedProjects.some(
        (p) => (p.name || "").trim().toLowerCase() === cProj
      );
      if (matchesProject) return true;

      const matchesSite = assignedSites.some((s) => {
        const siteProj = (s.projectName || "").trim().toLowerCase();
        const siteName = (s.name || "").trim().toLowerCase();
        return siteProj === cProj || siteName === cProj;
      });
      return matchesSite;
    });
  }

  return contractors;
};

/**
 * Checks whether an RFI is visible to the current user according to their permissions.
 */
export const isRfiVisibleToUser = (
  rfi: JobRFI,
  assignedProjectsOrUser?: ProjectItem[] | CurrentUserRef | null,
  assignedSites: ConstructionSite[] = [],
  maybeUser?: CurrentUserRef | null
): boolean => {
  let user: CurrentUserRef | null | undefined;
  let assignedProjects: ProjectItem[] = [];

  if (assignedProjectsOrUser && typeof assignedProjectsOrUser === "object" && "role" in assignedProjectsOrUser) {
    user = assignedProjectsOrUser as CurrentUserRef;
  } else {
    assignedProjects = (assignedProjectsOrUser as ProjectItem[]) || [];
    user = maybeUser;
  }

  if (!user || isAdminOrOwner(user) || isProjectManager(user)) {
    return true;
  }

  const userName = (user.name || "").trim().toLowerCase();
  const userId = String(user.id || "").toLowerCase();

  // Field Worker: only RFIs created by this worker or assigned to their job
  if (isFieldWorker(user)) {
    const createdBy = (rfi.createdBy || "").trim().toLowerCase();
    const createdById = String(rfi.createdById || "").toLowerCase();
    if (
      createdBy === userName ||
      createdBy.includes(userName) ||
      userName.includes(createdBy)
    ) {
      return true;
    }
    if (createdById === userId || createdById === `user-${userId}`) {
      return true;
    }
    return false;
  }

  // Site Manager: RFIs matching their assigned sites or projects
  if (isSiteManager(user)) {
    const rfiProject = (rfi.projectName || "").trim().toLowerCase();
    const rfiSite = (rfi.siteName || "").trim().toLowerCase();
    const rfiSiteId = String(rfi.siteId || "").trim().toLowerCase();

    const matchesProject = assignedProjects.some((p) => {
      const pName = (p.name || "").trim().toLowerCase();
      return (
        pName === rfiProject ||
        (rfiProject && pName.includes(rfiProject)) ||
        (pName && rfiProject.includes(pName))
      );
    });
    if (matchesProject) return true;

    const matchesSite = assignedSites.some((s) => {
      const sName = (s.name || "").trim().toLowerCase();
      const sProj = (s.projectName || "").trim().toLowerCase();
      const sId = String(s.id || "").trim().toLowerCase();
      return (
        sId === rfiSiteId ||
        sName === rfiSite ||
        sProj === rfiProject ||
        (rfiSite && sName.includes(rfiSite)) ||
        (rfiSite && rfiSite.includes(sName))
      );
    });
    if (matchesSite) return true;

    return false;
  }

  return true;
};

/**
 * Checks whether a Variation is visible to the current user according to their permissions.
 */
export const isVariationVisibleToUser = (
  variation: JobVariation,
  assignedProjectsOrUser?: ProjectItem[] | CurrentUserRef | null,
  assignedSites: ConstructionSite[] = [],
  maybeUser?: CurrentUserRef | null
): boolean => {
  let user: CurrentUserRef | null | undefined;
  let assignedProjects: ProjectItem[] = [];

  if (assignedProjectsOrUser && typeof assignedProjectsOrUser === "object" && "role" in assignedProjectsOrUser) {
    user = assignedProjectsOrUser as CurrentUserRef;
  } else {
    assignedProjects = (assignedProjectsOrUser as ProjectItem[]) || [];
    user = maybeUser;
  }

  if (!user || isAdminOrOwner(user) || isProjectManager(user)) {
    return true;
  }

  const userName = (user.name || "").trim().toLowerCase();
  const userId = String(user.id || "").toLowerCase();

  // Field Worker: only variations created by this worker
  if (isFieldWorker(user)) {
    const createdBy = (variation.createdBy || "").trim().toLowerCase();
    const createdById = String(variation.createdById || "").toLowerCase();
    if (
      createdBy === userName ||
      createdBy.includes(userName) ||
      userName.includes(createdBy)
    ) {
      return true;
    }
    if (createdById === userId || createdById === `user-${userId}`) {
      return true;
    }
    return false;
  }

  // Site Manager: Variations matching their assigned sites or projects
  if (isSiteManager(user)) {
    const varProject = (variation.projectName || "").trim().toLowerCase();
    const varSite = (variation.siteName || "").trim().toLowerCase();
    const varSiteId = String(variation.siteId || "").trim().toLowerCase();

    const matchesProject = assignedProjects.some((p) => {
      const pName = (p.name || "").trim().toLowerCase();
      return (
        pName === varProject ||
        (varProject && pName.includes(varProject)) ||
        (pName && varProject.includes(pName))
      );
    });
    if (matchesProject) return true;

    const matchesSite = assignedSites.some((s) => {
      const sName = (s.name || "").trim().toLowerCase();
      const sProj = (s.projectName || "").trim().toLowerCase();
      const sId = String(s.id || "").trim().toLowerCase();
      return (
        sId === varSiteId ||
        sName === varSite ||
        sProj === varProject ||
        (varSite && sName.includes(varSite)) ||
        (varSite && varSite.includes(sName))
      );
    });
    if (matchesSite) return true;

    return false;
  }

  return true;
};

/**
 * Who has permission to review an RFI (submit technical directive & change status)
 */
export const canReviewRfi = (user?: CurrentUserRef | null): boolean => {
  if (!user) return false;
  return (
    user.role === "PROJECT_MANAGER" ||
    user.role === "SITE_MANAGER" ||
    user.role === "OWNER" ||
    user.role === "ACCOUNT_ADMIN"
  );
};

/**
 * Who has permission to Approve or Reject a Variation
 */
export const canApproveVariation = (user?: CurrentUserRef | null): boolean => {
  if (!user) return false;
  return (
    user.role === "PROJECT_MANAGER" ||
    user.role === "OWNER" ||
    user.role === "ACCOUNT_ADMIN"
  );
};

/**
 * Who has permission to Approve or Reject a Purchase Order
 */
export const canApprovePurchaseOrder = (user?: CurrentUserRef | null): boolean => {
  if (!user) return false;
  return (
    user.role === "FINANCE_MANAGER" ||
    user.role === "OWNER" ||
    user.role === "ACCOUNT_ADMIN"
  );
};

/**
 * Who has permission to Approve or Authorize a Supplier Bill
 */
export const canApproveSupplierBill = (user?: CurrentUserRef | null): boolean => {
  if (!user) return false;
  return (
    user.role === "FINANCE_MANAGER" ||
    user.role === "OWNER" ||
    user.role === "ACCOUNT_ADMIN"
  );
};
