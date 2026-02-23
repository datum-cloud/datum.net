// src/libs/ashby.ts
/**
 * Ashby API integration for job postings
 */

const ASHBY_JOB_BOARD_NAME = 'datum';

export interface AshbyJob {
  id: string;
  title: string;
  department: string;
  team: string;
  location: string;
  employmentType: string;
  isRemote: boolean;
  publishedDate: string;
  jobUrl: string;
  locationObject?: AshbyLocation;
  compensation?: AshbyCompensation;
}

export interface AshbyLocation {
  id: string;
  name: string;
  isRemote: boolean;
  city?: string;
  region?: string;
  country?: string;
}

export interface AshbyCompensation {
  compensationTierSummary?: string;
  summaryComponents?: Array<{
    label: string;
    value: string;
  }>;
}

export interface AshbyJobBoardResponse {
  jobs: AshbyJob[];
}

export interface GroupedJobs {
  [department: string]: AshbyJob[];
}

/**
 * Fetches all job postings from Ashby public posting API
 * @returns Promise<AshbyJob[]> - Array of job postings
 */
export async function fetchJobPostings(): Promise<AshbyJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${ASHBY_JOB_BOARD_NAME}?includeCompensation=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const data: AshbyJobBoardResponse = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching Ashby jobs:', error);
    return [];
  }
}

/**
 * Groups jobs by department name
 * @param jobs - Array of job postings
 * @returns GroupedJobs - Jobs grouped by department
 */
export function groupJobsByDepartment(jobs: AshbyJob[]): GroupedJobs {
  return jobs.reduce((acc: GroupedJobs, job) => {
    const department = job.department || 'Other';
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(job);
    return acc;
  }, {});
}

/**
 * Get unique departments from jobs
 * @param jobs - Array of job postings
 * @returns string[] - Unique department names
 */
export function getUniqueDepartments(jobs: AshbyJob[]): string[] {
  return [...new Set(jobs.map((job) => job.department || 'Other'))];
}

/**
 * Get unique locations from jobs
 * @param jobs - Array of job postings
 * @returns string[] - Unique location names
 */
export function getUniqueLocations(jobs: AshbyJob[]): string[] {
  return [...new Set(jobs.map((job) => job.location || 'Unknown'))];
}

/**
 * Get unique employment types from jobs
 * @param jobs - Array of job postings
 * @returns string[] - Unique employment types
 */
export function getUniqueEmploymentTypes(jobs: AshbyJob[]): string[] {
  return [...new Set(jobs.map((job) => job.employmentType || 'Unknown'))];
}

/**
 * Format location string for display
 * @param job - Job posting
 * @returns string - Formatted location string
 */
export function formatJobLocation(job: AshbyJob): string {
  return job.location || 'Unknown';
}

/**
 * Format work type (Remote/On-site/Hybrid)
 * @param job - Job posting
 * @returns string - Work type label
 */
export function getWorkType(job: AshbyJob): string {
  return job.isRemote ? 'Remote' : 'On-site';
}
