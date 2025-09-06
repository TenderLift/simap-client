/**
 * Aggregate all MSW handlers for the SIMAP API
 */

import {projectsHandlers} from './projects.handlers';
import {referenceDataHandlers} from './reference-data.handlers';

// Combine all default handlers
export const handlers = [...projectsHandlers, ...referenceDataHandlers];

// Export individual handler groups for selective use in tests
export {projectsHandlers} from './projects.handlers';
export {referenceDataHandlers} from './reference-data.handlers';
export {errorHandlers, createErrorHandler} from './errors.handlers';
