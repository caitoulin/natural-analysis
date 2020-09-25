import axios from 'axios';
const locationIp = 'http://localhost:2379';

const axiosRequest = axios.create({
    baseURL: locationIp,
    timeout: 1000,
});

export function getTyphoonOrigin() {
    return axiosRequest.get('/get/typhoonOrigin');
}

export function getTyphoonLists() {
    return axiosRequest.get('/get/typhoonList');
}
