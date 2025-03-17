import { store } from "../../../../store/store";
import { updateAdj, updateStoneGroups } from "../../../../store/reducers/gamePlaySlice";
import { getSameColorNeighborGroups } from "./helpers";

let consolidateAndReturnPrimaryStoneGroup = (rootIndices) => {
    console.log('consolidate ' + rootIndices);
    let stoneGroups = store.getState().gamePlay.stoneGroups;

    let sameColorNeighborGroups = getSameColorNeighborGroups(rootIndices);
    let primaryGroupNumber = sameColorNeighborGroups[0];
    let consolidatedStones = [...stoneGroups.getStones(primaryGroupNumber)];

    for (let groupNumber of sameColorNeighborGroups) {
        if (groupNumber != primaryGroupNumber) {
            consolidateAdjMap(groupNumber, primaryGroupNumber); // consolidate adj
            consolidatedStones.push(...stoneGroups.getStones(groupNumber)); // consolidate stoneGroups
            stoneGroups.deleteStoneGroup(groupNumber);
        }
    }

    stoneGroups.setStoneGroup(primaryGroupNumber, [...consolidatedStones, rootIndices]);
    store.dispatch(updateStoneGroups({ stoneGroups }));
    return primaryGroupNumber;
}

let consolidateAdjMap = (groupNumber, primaryGroupNumber) => {
    let adjMap = store.getState().gamePlay.adjMap;
    for (let [adj, adjArr] of adjMap.getAdjEntries()) {
        if (adjArr.includes(groupNumber)) {
            adjArr.splice(adjArr.indexOf(groupNumber), 1);
            if (!adjArr.includes(primaryGroupNumber)) adjArr.push(primaryGroupNumber);
            adjMap.setAdj(adj, adjArr);
        }
    }
    store.dispatch(updateAdj({ adjMap }));
}

export default consolidateAndReturnPrimaryStoneGroup;