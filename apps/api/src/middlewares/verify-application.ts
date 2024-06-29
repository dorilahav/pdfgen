import { getApplicationIdFromToken, isValidToken } from '@pdfgen/application-token';
import { logger } from '@pdfgen/logging';
import { MiddlewareHandler } from 'hono';
import { isValidObjectId } from 'mongoose';
import { Application } from '../models';

const AUTH_HEADER_SECTIONS_SEPERATOR = ' ';

const getAuthSections = (authorizationHeader: string): string[] => {
  return authorizationHeader.split(AUTH_HEADER_SECTIONS_SEPERATOR);
}

const isValidAuthorizationHeader = (authorizationHeader: string): boolean => {
  const sections = getAuthSections(authorizationHeader);

  if (sections.length !== 2) {
    return false;
  }

  return true;
}

interface BearerFlowAuthorizationDetails {
  flow: 'bearer';
  token: string;
}

// This type only supports bearer token flow, if some other flows needs to be supported, they will need to be added here.
type AuthorizationDetails = BearerFlowAuthorizationDetails;
type SupportedAuthorizationFlows = AuthorizationDetails['flow'];

const getFlowFromAuthHeader = (authorizationHeader: string): string => {
  return getAuthSections(authorizationHeader)[0].toLowerCase();
}

// This function only supports bearer token flow, if some other flows needs to be supported, this function will need to change.
const constructAuthDetails = (flow: SupportedAuthorizationFlows, authorizationHeader: string): AuthorizationDetails => {
  const [, token] = getAuthSections(authorizationHeader);

  return {
    flow,
    token
  };
}

// This function only supports bearer token flow, if some other flows needs to be supported, this function will need to change.
const isAuthorizationFlowSupported = (flow: string): flow is SupportedAuthorizationFlows => {
  return flow === 'bearer';
}

// This function only supports bearer token flow, if some other flows needs to be supported, this function will need to change.
const getApplicationFromAuthorizationDetails = async ({token}: AuthorizationDetails): Promise<Application | null> => {
  const applicationId = getApplicationIdFromToken(token);

  if (!isValidObjectId(applicationId)) {
    return null;
  }

  return await Application.findById(applicationId);
}

// This function only supports bearer token flow, if some other flows needs to be supported, this function will need to change.
const isAuthorized = ({token}: AuthorizationDetails, application: Application) => {
  return isValidToken(token, application.id, application.secret);
}

interface ApplicationEnvironment {
  Variables: {
    application: Application;
  }
}

export const verifyApplication: MiddlewareHandler<ApplicationEnvironment> = async (c, next) => {
  const authorization = c.req.header('Authorization');

  if (!authorization || !isValidAuthorizationHeader(authorization)) {
    logger.info({msg: 'Got request with invalid authorization header', data: {authorization: authorization ?? null}});
    
    return c.json({error: 'Invalid authorization header'}, 400);
  }

  const flow = getFlowFromAuthHeader(authorization);

  if (!flow || !isAuthorizationFlowSupported(flow)) {
    logger.info({msg: 'Got request with invalid authorization flow', data: {flow}});

    return c.json({error: 'Invalid authorization flow'}, 400);
  }

  const details = constructAuthDetails(flow, authorization);
  const application = await getApplicationFromAuthorizationDetails(details);

  if (!application || !isAuthorized(details, application)) {
    logger.info({msg: 'Got unauthorized request', data: {...details, applicationId: application?.id ?? 'Couldn\'t get from auth details'}});

    return c.newResponse(null, 401);
  }

  c.set('application', application);

  await next();
}