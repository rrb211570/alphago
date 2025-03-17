import { store } from "../../../store/store.js";
import { updateAdj, deleteAdj } from '../../../store/reducers/gamePlaySlice.js'
import { getAllNeighborIndices, getNeighborStones, makeAndReturnNewStoneGroup, getSameColorNeighborGroups } from "./modifiers/helpers.js";
import capturable from "./modifiers/capturable.js";
import consolidateAndReturnPrimaryStoneGroup from "./modifiers/consolidate.js";

let placeable = (rootIndices) => {
  console.log('placeable:: ' + rootIndices);
  // open space
  if (openSpace(rootIndices)) {
    console.log('open space');
    if (hasSameColorNeighborGroups(rootIndices)) {
      console.log('placeable:: open space, consolidate');
      addNeighborIndicesOfPlacedStone(rootIndices, consolidateAndReturnPrimaryStoneGroup(rootIndices));
    } else {
      console.log('placeable:: open space, newStoneGroup');
      addNeighborIndicesOfPlacedStone(rootIndices, makeAndReturnNewStoneGroup(rootIndices));
    }
  } else if (hasSameColorNeighborGroups(rootIndices)) { // surrounded, check exposed
    console.log('surrounded');
    if (hasExposedNeighbor) {
      console.log('placeable:: surrounded, consolidate');
      addNeighborIndicesOfPlacedStone(rootIndices, consolidateAndReturnPrimaryStoneGroup(rootIndices));
    }
  } else if (capturable(rootIndices)) { // surrounded, check capturable; capturable() does capturing if possible
    console.log('capturable');
    if (hasSameColorNeighborGroups(rootIndices)) {
      console.log('placeable:: surrounded, capturable, consolidate');
      addNeighborIndicesOfPlacedStone(rootIndices, consolidateAndReturnPrimaryStoneGroup(rootIndices));
    } else {
      console.log('placeable:: surrounded, capturable, newStoneGroup');
      addNeighborIndicesOfPlacedStone(rootIndices, makeAndReturnNewStoneGroup(rootIndices));
    }
  } else {
    console.log('placeable:: surrounded, not exposed or capturable');
    return false;
  }
  if (store.getState().gamePlay.adjMap.hasAdj(rootIndices)) store.dispatch(deleteAdj({ indices: rootIndices }));
  return true;
}

let openSpace = (rootIndices) => { return getNeighborStones(rootIndices).length < getAllNeighborIndices(rootIndices).length }
let hasSameColorNeighborGroups = (rootIndices) => { return getSameColorNeighborGroups(rootIndices).length > 0 }

let hasExposedNeighbor = (rootIndices) => {
  let sameColorNeighborGroups = getSameColorNeighborGroups(rootIndices);
  for (let sameColorNeighborGroup of sameColorNeighborGroups) {
    if (exposed(sameColorNeighborGroup, rootIndices)) return true;
  }
  return false;
}

let exposed = (sameColorNeighborGroup, rootIndices) => {
  let adjMap = store.getState().gamePlay.adjMap;
  for (let [indices, adjArr] of adjMap.getAdjEntries()) {
    if (indices != rootIndices && adjArr.includes(sameColorNeighborGroup)) { // we ignore rootIndices b/c we are checking for outward exposure, not inward
      console.log('exposed: ' + sameColorNeighborGroup);
      return true;
    }
  }
  return false;
}

let addNeighborIndicesOfPlacedStone = (rootIndices, groupNumber) => {
  let placedStones = store.getState().gamePlay.placedStones;
  let adjMap = store.getState().gamePlay.adjMap;
  for (let neighborIndices of getAllNeighborIndices(rootIndices)) {
    if (!placedStones.includes(neighborIndices)) {
      if (!adjMap.hasAdj(neighborIndices)) adjMap.setAdj(neighborIndices, [groupNumber])
      else if (!adjMap.getAdj(neighborIndices).includes(groupNumber)) adjMap.setAdj(neighborIndices, [...adjMap.getAdj(neighborIndices), groupNumber])
    }
  }
  store.dispatch(updateAdj({ adjMap }));
}

export default placeable;