import { store } from "../../../store/store";
import { deletePlacedStone } from "../../../store/reducers/gamePlaySlice";


let capturable = (rootIndices) => {
    let stoneGroups = store.getState().gamePlay.stoneGroups;
    let adjMap = store.getState().gamePlay.adjMap;
    let groupNumbers = [...stoneGroups.getStoneGroupKeys()];
    for (let [indices, adjArr] of adjMap.getEntries()) {
      if (indices == rootIndices) continue;
      for (let groupNumber of adjArr) {
        if (groupNumbers.includes(groupNumber)) groupNumbers.splice(groupNumbers.find(groupNumber), 1);
      }
    }
    if (groupNumbers.length > 0) { // has one group (to be captured)
      console.log(groupNumbers);
      let capturedStones = stoneGroups.getStoneGroup(groupNumbers[0]);
      stoneGroups.deleteStoneGroup(groupNumbers[0]);
      store.dispatch(updateStoneGroups({ stoneGroups }));
      // remove capturedStones from placedStones
      for (let stoneID of capturedStones) store.dispatch(deletePlacedStone({ stoneID }));
  
      // create adj for each capturedStone index (consider rootIndices)
      replaceCaptureWithAdj(capturedStones, rootIndices);
      return true;
    }
    return false;
  }
  let replaceCaptureWithAdj = (capturedStones, rootIndices) => {
    let placedStones = store.getState().gamePlay.placedStones;
    let adjMap = store.getState().gamePlay.adjMap;
    let groupArr = [];
    for (let stoneID of capturedStones) {
      for (let adjIndices of getNeighborIndices(stoneID)) {
        if (placedStones.includes(adjIndices)) {
          let groupNumber = getStoneGroupFromStone(adjIndices);
          if (!groupArr.includes(groupNumber)) groupArr.push(groupNumber);
        }
      }
      adjMap.setAdj(stoneID, groupArr);
    }
    store.dispatch(updateAdj({ adjMap }));
  }
  
  let getStoneGroupFromStone = (indices) => {
    let stoneGroups = store.getState().gamePlay.stoneGroups;
    for (let [groupNumber, stoneArr] of stoneGroups.getStoneGroupEntries()) {
      if (stoneArr.includes(indices)) return groupNumber;
    }
    throw 'getStoneGroup:: stoneGroups does not contain ' + indices;
  }

  export default capturable;