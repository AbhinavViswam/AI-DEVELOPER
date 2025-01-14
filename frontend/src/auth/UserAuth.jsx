import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const UserAuth = ({ children }) => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
          
            navigate('/login');
        } else if (!user) {
          
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                navigate('/login'); 
            }
        }

        setLoading(false);
    }, [user, setUser, navigate]);

    if (loading) {
        return <div className="text-center mt-20 text-lg">Loading...</div>;
    }

    return (
        <>
            {children}
        </>
    );
};

export default UserAuth;
