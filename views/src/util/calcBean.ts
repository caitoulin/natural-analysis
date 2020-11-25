export default class CalcBean {
    count: number;
    sumy: number;
    constructor() {
        this.count = 0;
        this.sumy = 0;
    }
    getCount() {
        return this.count;
    }
    setCount(count: number) {
        this.count = count;
    }
    getSumy() {
        return this.sumy;
    }
    setSumy(sumy: number) {
        this.sumy = sumy;
    }
    incrementCount() {
        this.count++;
    }
    incrementSumY(sumy: number) {
        this.sumy += sumy;
    }
}
