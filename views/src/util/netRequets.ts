import axios from 'axios';
const locationIp = 'http://localhost:2379';

const axiosRequest = axios.create({
    baseURL: locationIp,
    timeout: 5000,
});

export function getTyphoonLandedOrigin() {
    return axiosRequest.get('/get/typhoonLandedOrigin');
}

export function getTyphoonLists() {
    return axiosRequest.get('/get/typhoonList');
}

export function getInfluenceIndex() {
    return axiosRequest.get('/get/influenceIndex');
}

export function getTracksGrid() {
    return axiosRequest.get('/get/grid');
}
