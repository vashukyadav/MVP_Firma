import type { ProjectItem } from "@/store/leadFlowStore";
import type { ConstructionSite } from "@/store/siteStore";
import type { JobItem, AwardedContractor } from "@/store/tenderFlowStore";

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

/**
 * Checks whether a given project is assigned to the current user.
 */
export const isProjectAssignedToUser = (
  project: ProjectItem,
  sites: ConstructionSite[] = [],
  user?: CurrentUserRef | null
): boolean => {
  if (!user) return true; // Default fallback if no auth

  // Owners and Account Admins have full company-wide visibility
  if (isAdminOrOwner(user)) {
    return true;
  }

  // Project Managers see projects they lead, or default to all if none explicitly filtered
  if (isProjectManager(user)) {
    if (!project.lead) return true;
    return (
      project.lead.trim().toLowerCase() === user.name?.trim().toLowerCase() ||
      project.lead.trim().toLowerCase() === "project lead" ||
      project.lead.trim().toLowerCase() === "project manager"
    );
  }

  // Site Manager: ONLY assigned projects
  if (isSiteManager(user)) {
    const userName = (user.name || "").trim().toLowerCase();
    const userId = String(user.id || "");

    // 1. Explicit siteManagerName or ID on project
    if (project.siteManagerName && project.siteManagerName.trim().toLowerCase() === userName) {
      return true;
    }
    if (project.siteManagerId && (String(project.siteManagerId) === userId || project.siteManagerId === `user-${userId}`)) {
      return true;
    }

    // 2. Project lead matches this Site Manager
    if (project.lead && project.lead.trim().toLowerCase() === userName) {
      return true;
    }

    // 3. Any construction site matching this project assigned to this Site Manager
    const matchingSite = sites.find((s) => {
      const siteProject = (s.projectName || "").trim().toLowerCase();
      const projName = (project.name || "").trim().toLowerCase();
      const siteName = (s.name || "").trim().toLowerCase();

      const nameMatch = siteProject === projName || siteName === projName;
      if (!nameMatch) return false;

      const mgrName = (s.siteManagerName || "").trim().toLowerCase();
      const mgrId = String(s.siteManagerId || "");
      return mgrName === userName || mgrId === userId || mgrId === `user-${userId}`;
    });

    return Boolean(matchingSite);
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
  if (!user || isAdminOrOwner(user)) {
    return projects;
  }
  return projects.filter((p) => isProjectAssignedToUser(p, sites, user));
};

/**
 * Filter list of construction sites assigned to the current user.
 */
export const getAssignedSites = (
  sites: ConstructionSite[] = [],
  user?: CurrentUserRef | null,
  assignedProjects: ProjectItem[] = []
): ConstructionSite[] => {
  if (!user || isAdminOrOwner(user) || isProjectManager(user)) {
    return sites;
  }

  if (isSiteManager(user)) {
    const userName = (user.name || "").trim().toLowerCase();
    const userId = String(user.id || "");

    // 1. Direct site matches or matches via project name
    const matchedSites = sites.filter((site) => {
      const mgrName = (site.siteManagerName || "").trim().toLowerCase();
      const mgrId = String(site.siteManagerId || "");
      const directMatch =
        (mgrName && (mgrName === userName || mgrName.includes(userName) || userName.includes(mgrName))) ||
        mgrId === userId ||
        mgrId === `user-${userId}` ||
        userId === `user-${mgrId}`;
      if (directMatch) return true;

      // Match by assigned project name
      const siteProject = (site.projectName || "").trim().toLowerCase();
      const siteName = (site.name || "").trim().toLowerCase();
      const matchesAssignedProject = assignedProjects.some((p) => {
        const pName = (p.name || "").trim().toLowerCase();
        return (
          pName === siteProject ||
          pName === siteName ||
          (siteProject && (pName.includes(siteProject) || siteProject.includes(pName))) ||
          (siteName && (pName.includes(siteName) || siteName.includes(pName)))
        );
      });

      return matchesAssignedProject;
    });

    // 2. Synthesize/ensure each assigned project has a visible site representation
    // if no explicit site in `sites` matches it yet
    const result = [...matchedSites];
    assignedProjects.forEach((proj) => {
      const pName = (proj.name || "").trim().toLowerCase();
      const hasSite = result.some((s) => {
        const sProj = (s.projectName || "").trim().toLowerCase();
        const sName = (s.name || "").trim().toLowerCase();
        return (
          sProj === pName ||
          sName === pName ||
          (sProj && (pName.includes(sProj) || sProj.includes(pName)))
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

  if (isAdminOrOwner(user) || isProjectManager(user)) {
    return true;
  }

  const userName = (user.name || "").trim().toLowerCase();
  const userId = String(user.id || "");

  // Field Worker: only jobs assigned to this specific worker
  if (isFieldWorker(user)) {
    const assignee = (job.assignee || "").trim().toLowerCase();
    if (!assignee || !userName) return false;
    return (
      assignee === userName ||
      assignee.includes(userName) ||
      userName.includes(assignee)
    );
  }

  // Site Manager
  if (isSiteManager(user)) {
    // 1. Direct SM tag on job
    const mgrName = (job.siteManagerName || "").trim().toLowerCase();
    const mgrId = String(job.siteManagerId || "");
    if (mgrName && (mgrName === userName || mgrName.includes(userName) || userName.includes(mgrName))) {
      return true;
    }
    if (mgrId && (mgrId === userId || mgrId === `user-${userId}` || userId === `user-${mgrId}`)) {
      return true;
    }

    // 2. SM directly assigned as assignee
    const assignee = (job.assignee || "").trim().toLowerCase();
    if (assignee && (assignee === userName || assignee.includes(userName) || userName.includes(assignee))) {
      return true;
    }

    // 3. Job project matches one of this SM's assigned projects (fuzzy match)
    const jobProject = (job.projectName || "").trim().toLowerCase();
    const matchesProject = assignedProjects.some((p) => {
      const pName = (p.name || "").trim().toLowerCase();
      return (
        pName === jobProject ||
        (jobProject && pName.includes(jobProject)) ||
        (pName && jobProject.includes(pName))
      );
    });
    if (matchesProject) return true;

    // 4. Job project or location matches one of this SM's assigned sites
    const jobLocation = (job.location || "").trim().toLowerCase();
    const matchesSite = assignedSites.some((s) => {
      const siteProj = (s.projectName || "").trim().toLowerCase();
      const siteName = (s.name || "").trim().toLowerCase();
      const siteAddress = (s.address || "").trim().toLowerCase();

      return (
        (siteProj && siteProj === jobProject) ||
        (siteName && siteName === jobProject) ||
        (siteProj && jobProject.includes(siteProj)) ||
        (siteName && jobProject.includes(siteName)) ||
        (siteName && jobLocation.includes(siteName)) ||
        (siteAddress && jobLocation.includes(siteAddress))
      );
    });

    return matchesSite;
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
  if (!user || isAdminOrOwner(user) || isProjectManager(user)) {
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
