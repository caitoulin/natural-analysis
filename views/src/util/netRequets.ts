import axios from 'axios';
export const locationIp = 'http://localhost:2379';

const axiosRequest = axios.create({
    baseURL: locationIp,
    timeout: 30000,
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

export function getDataIndex(url: string, data: any) {
    return axiosRequest.get(url, { params: { ...data } });
}
