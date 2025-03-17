import { store } from "../../../../store/store";
import { deleteStoneGroup, deletePlacedStone, updateAdj } from "../../../../store/reducers/gamePlaySlice";
import { getNeighborStones, getStoneGroupFromStone } from "./helpers";

let capturable = (capturingStoneIndices) => {
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  let orphanedStoneGroupNumbers = getOrphanedStoneGroupNumber(capturingStoneIndices);
  if (orphanedStoneGroupNumbers.length > 0) { // has one or more group (to be captured)
    for (let orphanedStoneGroupNumber of orphanedStoneGroupNumbers) {
      let deadStones = stoneGroups.getStones(orphanedStoneGroupNumber);
      deleteDeadStonesFromStoneGroupsAndPlacedStones(orphanedStoneGroupNumber, deadStones);
      replaceDeadStonesWithAdj(deadStones, capturingStoneIndices);
    }
    return true;
  }
  return false;
}

// 
let getOrphanedStoneGroupNumber = (capturingStoneIndices) => {
  let adjMap = store.getState().gamePlay.adjMap;
  let stoneGroupNumbers = [...store.getState().gamePlay.stoneGroups.getStoneGroupKeys()];
  let orphanedStoneGroupNumbers = [];
  for (let stoneGroupNumber of stoneGroupNumbers) {
    let totalExposedAdj = 0;
    for (let [indices, adjArr] of adjMap.getAdjEntries()) {
      if (adjArr.includes(stoneGroupNumber) && indices != capturingStoneIndices) totalExposedAdj++;
    }
    if (totalExposedAdj == 0) orphanedStoneGroupNumbers.push(stoneGroupNumber);
  }
  return orphanedStoneGroupNumbers;
}

let deleteDeadStonesFromStoneGroupsAndPlacedStones = (orphanedStoneGroupNumber, deadStones) => {
  store.dispatch(deleteStoneGroup({ stoneGroup: orphanedStoneGroupNumber }));
  for (let stoneID of deadStones) store.dispatch(deletePlacedStone({ indices: stoneID }));
}

let replaceDeadStonesWithAdj = (deadStones, capturingStoneIndices) => {
  let adjMap = store.getState().gamePlay.adjMap;

  for (let deadStone of deadStones) {
    console.log(deadStone);
    let adjArr = [];
    let neighborStones = getNeighborStones(deadStone);
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.display = 'none';
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.opacity = '0.7';
    if(neighborStones.includes(capturingStoneIndices)) continue; // we ignore this case, because capturingStoneIndices has not been updated yet in stoneGroups & adjMap
    
    for (let neighborStone of neighborStones) {
      let groupNumber = getStoneGroupFromStone(neighborStone);
      if (!adjArr.includes(groupNumber)) adjArr.push(groupNumber);
    }
    if (adjArr.length != 0) adjMap.setAdj(deadStone, adjArr); // we could have a deadStone surrounded by deadStones, so we check for that
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.display = 'none';
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.opacity = '0.7';
    adjMap.setAdj(deadStone, adjArr);
  }
  store.dispatch(updateAdj({ adjMap }));
}

export default capturable;