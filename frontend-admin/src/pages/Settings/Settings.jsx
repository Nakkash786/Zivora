import React, {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import api from "../../services/api";

import "./Settings.css";


const Settings = () => {

    const navigate = useNavigate();

    const {
        logout,
    } = useAuth();


    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);


    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });


    const [passwordMessage, setPasswordMessage] =
        useState("");

    const [passwordError, setPasswordError] =
        useState("");

    const [changingPassword, setChangingPassword] =
        useState(false);


    /* =========================================================
       FETCH ADMIN PROFILE
    ========================================================= */

    useEffect(() => {

        fetchProfile();

    }, []);


    const fetchProfile = async () => {

        try {

            setLoading(true);


            const response =
                await api.get(
                    "/accounts/admin/profile/"
                );


            setProfile(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load admin profile:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "admin_access_token"
                );

                localStorage.removeItem(
                    "admin_refresh_token"
                );

                localStorage.removeItem(
                    "admin_user"
                );


                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );
            }

        } finally {

            setLoading(false);

        }
    };


    /* =========================================================
       PASSWORD INPUT
    ========================================================= */

    const handlePasswordChange = (e) => {

        setPasswordData({
            ...passwordData,

            [e.target.name]:
                e.target.value,
        });

    };


    /* =========================================================
       CHANGE PASSWORD
    ========================================================= */

    const handleChangePassword = async (e) => {

        e.preventDefault();


        setPasswordMessage("");

        setPasswordError("");


        /* -----------------------------------------------------
           REQUIRED FIELDS
        ----------------------------------------------------- */

        if (
            !passwordData.current_password ||
            !passwordData.new_password ||
            !passwordData.confirm_password
        ) {

            setPasswordError(
                "Please fill all password fields."
            );

            return;
        }


        /* -----------------------------------------------------
           PASSWORD MATCH
        ----------------------------------------------------- */

        if (
            passwordData.new_password !==
            passwordData.confirm_password
        ) {

            setPasswordError(
                "New password and confirm password do not match."
            );

            return;
        }


        /* -----------------------------------------------------
           PASSWORD LENGTH
        ----------------------------------------------------- */

        if (
            passwordData.new_password.length < 8
        ) {

            setPasswordError(
                "New password must be at least 8 characters long."
            );

            return;
        }


        try {

            setChangingPassword(true);


            await api.post(
                "/accounts/change-password/",
                {
                    current_password:
                        passwordData.current_password,

                    new_password:
                        passwordData.new_password,
                }
            );


            setPasswordMessage(
                "Password changed successfully."
            );


            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to change password.";


            setPasswordError(
                message
            );

        } finally {

            setChangingPassword(false);

        }
    };


    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = async () => {

        /*
         * IMPORTANT:
         *
         * Do NOT manually remove tokens here.
         *
         * AuthContext handles:
         *
         * 1. Backend logout
         * 2. admin_access_token
         * 3. admin_refresh_token
         * 4. admin_user
         * 5. admin state
         * 6. Redirect to login
         */

        try {

            await logout();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            /*
             * Emergency cleanup
             * if AuthContext logout somehow fails.
             */

            localStorage.removeItem(
                "admin_access_token"
            );

            localStorage.removeItem(
                "admin_refresh_token"
            );

            localStorage.removeItem(
                "admin_user"
            );


            window.location.replace(
                "/login"
            );
        }
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (
            <div className="settings-page">

                <div className="settings-loading">

                    Loading settings...

                </div>

            </div>
        );
    }


    /* =========================================================
       UI
    ========================================================= */

    return (

        <div className="settings-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="settings-header">

                <div>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your admin account and security settings.
                    </p>

                </div>

            </div>


            {/* =================================================
                PROFILE
            ================================================= */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div>

                        <h2>
                            Admin Profile
                        </h2>

                        <p>
                            Your administrator account information.
                        </p>

                    </div>

                </div>


                <div className="profile-section">


                    {/* PROFILE AVATAR */}

                    <div className="profile-avatar">

                        {profile?.profile_image ? (

                            <img
                                src={profile.profile_image}
                                alt="Admin"
                            />

                        ) : (

                            <span>

                                {(
                                    profile?.username ||
                                    profile?.email ||
                                    "A"
                                )
                                    .charAt(0)
                                    .toUpperCase()}

                            </span>

                        )}

                    </div>


                    {/* PROFILE INFORMATION */}

                    <div className="profile-info">


                        <div className="profile-field">

                            <label>
                                Username
                            </label>

                            <div className="profile-value">

                                {profile?.username || "-"}

                            </div>

                        </div>


                        <div className="profile-field">

                            <label>
                                Email
                            </label>

                            <div className="profile-value">

                                {profile?.email || "-"}

                            </div>

                        </div>


                        <div className="profile-field">

                            <label>
                                Phone
                            </label>

                            <div className="profile-value">

                                {profile?.phone || "-"}

                            </div>

                        </div>


                        <div className="profile-field">

                            <label>
                                Role
                            </label>

                            <div className="profile-value role-value">

                                Administrator

                            </div>

                        </div>


                    </div>

                </div>

            </section>


            {/* =================================================
                CHANGE PASSWORD
            ================================================= */}

            <section className="settings-card">


                <div className="settings-card-header">

                    <div>

                        <h2>
                            Change Password
                        </h2>

                        <p>
                            Update your administrator account password.
                        </p>

                    </div>

                </div>


                {/* SUCCESS MESSAGE */}

                {passwordMessage && (

                    <div className="success-message">

                        {passwordMessage}

                    </div>

                )}


                {/* ERROR MESSAGE */}

                {passwordError && (

                    <div className="error-message">

                        {passwordError}

                    </div>

                )}


                <form
                    className="password-form"
                    onSubmit={handleChangePassword}
                >


                    {/* CURRENT PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="current_password">

                            Current Password

                        </label>

                        <input
                            id="current_password"
                            type="password"
                            name="current_password"
                            value={
                                passwordData.current_password
                            }
                            onChange={
                                handlePasswordChange
                            }
                            placeholder="Enter current password"
                        />

                    </div>


                    {/* NEW + CONFIRM PASSWORD */}

                    <div className="form-row">


                        <div className="form-group">

                            <label htmlFor="new_password">

                                New Password

                            </label>

                            <input
                                id="new_password"
                                type="password"
                                name="new_password"
                                value={
                                    passwordData.new_password
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Enter new password"
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="confirm_password">

                                Confirm New Password

                            </label>

                            <input
                                id="confirm_password"
                                type="password"
                                name="confirm_password"
                                value={
                                    passwordData.confirm_password
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Confirm new password"
                            />

                        </div>


                    </div>


                    {/* PASSWORD ACTION */}

                    <div className="password-actions">

                        <button
                            type="submit"
                            className="save-password-btn"
                            disabled={
                                changingPassword
                            }
                        >

                            {changingPassword
                                ? "Updating..."
                                : "Change Password"}

                        </button>

                    </div>


                </form>

            </section>


            {/* =================================================
                ACCOUNT
            ================================================= */}

            <section className="settings-card account-card">


                <div className="settings-card-header">

                    <div>

                        <h2>
                            Account
                        </h2>

                        <p>
                            Manage your administrator session.
                        </p>

                    </div>

                </div>


                <div className="logout-section">


                    <div>

                        <h3>
                            Logout
                        </h3>

                        <p>
                            Sign out from the Zivora Admin Panel.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >

                        Logout

                    </button>


                </div>

            </section>


        </div>
    );
};


export default Settings;