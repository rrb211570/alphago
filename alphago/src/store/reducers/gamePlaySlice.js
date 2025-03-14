import { createSlice } from '@reduxjs/toolkit';
import {StoneGroups, AdjMap} from '../../data/gameInteraction/gameInteraction.js';

export const gamePlaySlice = createSlice({
    name: 'gamePlay',
    initialState: {
        turn: 'white',
        boardLength: 9,
        placedStones: [],
        stoneGroups: new StoneGroups(),
        adjMap: new AdjMap()
    },
    reducers: {
        swapTurn(state, action) {
            if (state.turn == 'white') state.turn = 'black';
            else state.turn = 'white';
            state.boardLength = state.boardLength;
            state.placedStones = state.placedStones;
            state.stoneGroups = state.stoneGroups;
            state.adjMap = state.adjMap;
        },
        updatePlacedStones(state, action) {
            state.turn = state.turn;
            state.boardLength = state.boardLength;
            state.placedStones = action.payload.placedStones;
            state.stoneGroups = state.stoneGroups;
            state.adjMap = state.adjMap;
        },
        deletePlacedStone(state, action){
            state.turn = state.turn;
            state.boardLength = state.boardLength;
            state.placedStones = state.placedStones.filter((stone)=>stone!=action.payload.indices);
            state.stoneGroups = state.stoneGroups;
            state.adjMap = state.adjMap;
        },
        updateAdj(state, action) {
            state.turn = state.turn;
            state.boardLength = state.boardLength;
            state.placedStones = state.placedStones;
            state.stoneGroups = state.stoneGroups;
            state.adjMap = action.payload.adjMap;
        },
        deleteAdj(state, action) {
            state.turn = state.turn;
            state.boardLength = state.boardLength;
            state.placedStones = state.placedStones;
            state.stoneGroups = state.stoneGroups;
            state.adjMap = action.payload.adjMap;
        },
        updateStoneGroups(state, action){
            state.turn = state.turn;
            state.boardLength = state.boardLength;
            state.placedStones = state.placedStones;
            state.stoneGroups = action.payload.stoneGroups;
            state.adjMap = state.adjMap;
        }
    }
});

export const { swapTurn, updatePlacedStones, deletePlacedStone, updateAdj, deleteAdj, updateStoneGroups } = gamePlaySlice.actions;
export const getTurn = state => state.gamePlay.turn;
export const getBoardLength = state => state.gamePlay.boardLength;
export const getPlacedStones = state => state.gamePlay.placedStones;
export const getStoneGroups = state => state.gamePlay.stoneGroups;
export const getAdjMap = state => state.gamePlay.adjMap;

export default gamePlaySlice.reducer;