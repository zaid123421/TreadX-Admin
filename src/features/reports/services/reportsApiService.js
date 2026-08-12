import apiClient, {
  buildQueryParams,
  handleApiError,
  extractResponseData,
} from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

function resolveFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  if (plainMatch?.[1]) return plainMatch[1].trim();
  return fallback;
}

function triggerBrowserDownload(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export const reportsService = {
  /**
   * Download a report export (Excel or PDF) as a file.
   * @param {string} path endpoint relative to API base
   * @param {{ format: 'excel' | 'pdf', nameHint?: string, params?: Record<string, unknown> }} options
   */
  downloadExport: async (path, { format, nameHint = 'report', params } = {}) => {
    try {
      const query = params ? buildQueryParams(params) : '';
      const url = query ? `${path}?${query}` : path;
      const response = await apiClient.get(url, { responseType: 'blob' });
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const contentDisposition = response.headers?.['content-disposition'];
      const filename = resolveFilename(
        contentDisposition,
        `${nameHint}.${extension}`,
      );
      triggerBrowserDownload(response.data, filename);
      return filename;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to download report'));
    }
  },

  getCapacityOverview: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WMS_WAREHOUSES_CAPACITY_OVERVIEW);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch capacity overview'));
    }
  },
};
