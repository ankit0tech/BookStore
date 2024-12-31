declare module 'passport-google-oidc' {
    import { Strategy as PassportStrategy } from "passport";
    import { Request } from "express";

    interface StrategyOptions {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        passReqToCallback?: boolean;
        scope: string[]
    }

    type VerifyFunction = (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void
    ) => void;

    type VerifyFunctionWithRequest = (
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void
    ) => void;

    class Strategy extends PassportStrategy {
        constructor(
            options: StrategyOptions,
            verify: VerifyFunction | VerifyFunctionWithRequest
        );
    }

    export { Strategy, StrategyOptions };
}
