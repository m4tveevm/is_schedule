import {useContext, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../../context/AuthContext";

function Logout() {
    const navigate = useNavigate();
    const {hardLogout} = useContext(AuthContext);

    useEffect(() => {
        hardLogout();
        navigate("/login");
    }, [hardLogout, navigate]);

    return null;
}

export default Logout;