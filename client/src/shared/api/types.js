/**
 * @typedef {Object} LoginRequest
 * @property {string} login
 * @property {string} password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} accessToken
 * @property {string} expire
 * @property {number} expireMs
 */

/**
 * @typedef {Object} AccountInfoResponse
 * @property {{ usedCompanyCount: number, companyLimit: number }} eventFiltersInfo
 * @property {string} tariff
 * @property {{ name: string }} user
 */

/**
 * @typedef {Object} HistogramItem
 * @property {string} date
 * @property {number} value
 */

/**
 * @typedef {Object} HistogramResponse
 * @property {Array<{ histogramType: string, data: HistogramItem[] }>} data
 */

/**
 * @typedef {Object} ObjectSearchResponse
 * @property {Array<{ encodedId: string }>} items
 * @property {Array} mappings
 */

/**
 * @typedef {Object} DocumentResponse
 * @property {{ id: string, url: string, title?: { text: string }, content?: { markup: string } }} [ok]
 * @property {{ errorCode: string, errorMessage: string }} [fail]
 */
