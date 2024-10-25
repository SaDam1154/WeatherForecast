import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const VerifyEmail = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useParams();

    useEffect(() => {
        console.log(token);
        const verifyEmail = async () => {
            try {
                const response = await fetch(`https://weatherforecastbe.onrender.com/api/subscribe/verify?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Verification failed');
                }

                setIsVerified(true);
            } catch {
                setError('An error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setLoading(false);
            setError('No verification token provided.');
        }
    }, [token]);

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            <h1 className='text-2xl font-bold mb-4'>Verify Your Email</h1>
            {loading ? (
                <p>Loading...</p>
            ) : isVerified ? (
                <p className='text-green-500'>Your email has been successfully verified!</p>
            ) : (
                <p className='text-red-500'>{error}</p>
            )}
        </div>
    );
};

export default VerifyEmail;
