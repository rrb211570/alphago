


class StoneGroups {
    #stoneGroups;
    constructor() {
        this.#stoneGroups = new Map();
    }
    setStoneGroup(stoneGroup, stoneArr) {
        if (stoneGroup === null || stoneGroup === undefined || stoneArr === null || stoneArr === undefined) throw 'StoneGroups:setStoneGroup: stoneGroup or stoneArr is null/undefined';
        if (stoneGroup < 1) throw 'StoneGroups:setStoneGroup: stoneGroup is less than 1 :' + stoneGroup;
        if (stoneArr.length == 0) throw 'StoneGroups:setStoneGroup: stoneArr is empty:' + stoneArr;
        for (let indices of stoneArr) {
            let [x, y] = /^.*(\d+).*(\d+)$/.exec(indices).slice(1, 3);
            if (x < 0 || x > 8 || y < 0 || y > 8) throw 'StoneGroups:setStoneGroup: one or more indices in stoneArr out of range' + stoneArr;
        }
        this.#stoneGroups.set(stoneGroup, stoneArr);
    }
    hasStoneGroup(stoneGroup) {
        if (stoneGroup === null || stoneGroup === undefined) throw 'StoneGroups:hasStoneGroup: stoneGroup is null/undefined';
        return this.#stoneGroups.has(stoneGroup);
    }
    getStoneGroup(stoneGroup) {
        if (stoneGroup === null || stoneGroup === undefined) throw 'StoneGroups:getStoneGroup: stoneGroup is null/undefined';
        return this.#stoneGroups.get(stoneGroup);
    }
    deleteStoneGroup(stoneGroup) {
        if (stoneGroup === null || stoneGroup === undefined) throw 'StoneGroups:getStoneGroup: stoneGroup is null/undefined';
        this.#stoneGroups.delete(stoneGroup);
    }
    getStoneGroupKeys() {
        return this.#stoneGroups.keys();
    }
    getStoneGroupEntries() {
        return this.#stoneGroups.entries();
    }
    clearStoneGroupEntries() {
        this.#stoneGroups.clear();
    }
    size() {
        return this.#stoneGroups.size;
    }
}

class AdjMap {
    #adjMap;
    constructor() {
        this.#adjMap = new Map();
    }
    setAdj(indices, stoneGroupArr) {
        if (indices === null || indices === undefined || stoneGroupArr === null || stoneGroupArr === undefined) throw 'AdjMap:setAdj: indices or stoneGroupArr is null/undefined';
        if (stoneGroupArr.length == 0) throw 'AdjMaps:setAdj: stoneGroupArr is empty:' + stoneGroupArr;
        let [x, y] = /^.*(\d+).*(\d+)$/.exec(indices).slice(1, 3);
        if (x < 0 || x > 8 || y < 0 || y > 8) throw 'AdjMaps:setAdj: indices out of range' + indices;
        for (let indices of stoneGroupArr) {
            if (indices < 1) throw 'AdjMap::setAdj: one or more indices in stoneGroupArr less than 1' + stoneGroupArr;
        }
        this.#adjMap.set(indices, stoneGroupArr);
    }
    hasAdj(indices) {
        if (indices === null || indices === undefined) throw 'AdjMap:hasAdj: indices is null/undefined';
        return this.#adjMap.has(indices);
    }
    getAdj(indices) {
        if (indices === null || indices === undefined) throw 'AdjMap:getAdjMap: indices is null/undefined';
        return this.#adjMap.get(indices);
    }
    deleteAdj(indices) {
        if (indices === null || indices === undefined) throw 'AdjMap:getAdjMap: indices is null/undefined';
        this.#adjMap.delete(indices);
    }
    getAdjKeys(){
        return this.#adjMap.keys();
    }
    getAdjValues() {
        return this.#adjMap.values();
    }
    getAdjEntries() {
        return this.#adjMap.entries();
    }
    clearAdjEntries() {
        this.#adjMap.clear();
    }
    size() {
        return this.#adjMap.size;
    }
}

export { StoneGroups, AdjMap };