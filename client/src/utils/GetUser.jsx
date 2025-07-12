import axios from '../utils/axios';

export default async function GetUser() {
    try {
        const res = await axios.get('/api/auth');
        return res.data?.user;
    } catch (err) {
        console.error("Invalid token:", err);
        return null;
    }
}