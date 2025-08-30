import {createContext, useState, useEffect} from "react";
import PropTypes from "prop-types";
import {
    setAuthToken,
    setSessionToken,
    setupAxiosInterceptors,
    headlessLogin,
    jwtFromSession,
    logoutSession,
} from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState(() => {
        const access = localStorage.getItem("accessToken");
        const refresh = localStorage.getItem("refreshToken");
        const sessionToken = localStorage.getItem("sessionToken");
        if (sessionToken) setSessionToken(sessionToken);
        if (access) setAuthToken(access);
        return {
            isAuthenticated: Boolean(access && refresh),
            tokens: access && refresh ? {access, refresh} : null,
            sessionToken: sessionToken || null,
        };
    });

    useEffect(() => {
        setupAxiosInterceptors(hardLogout);
    }, []);

    const doLogin = async (username, password) => {
        // 1) headless → session token
        const {data: h} = await headlessLogin(username, password);
        const st = h?.meta?.session_token;
        if (!st) throw new Error("No session token");
        localStorage.setItem("sessionToken", st);
        setSessionToken(st);

        // 2) exchange → JWT pair
        const {data: pair} = await jwtFromSession();
        localStorage.setItem("accessToken", pair.access);
        localStorage.setItem("refreshToken", pair.refresh);
        setAuthToken(pair.access);
        setAuthState({isAuthenticated: true, tokens: pair, sessionToken: st});
    };

    const hardLogout = async () => {
        try {
            await logoutSession();
        } catch (_) {
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("sessionToken");
        setAuthToken(null);
        setSessionToken(null);
        setAuthState({isAuthenticated: false, tokens: null, sessionToken: null});
    };

    return (
        <AuthContext.Provider value={{authState, doLogin, hardLogout}}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {children: PropTypes.node.isRequired};