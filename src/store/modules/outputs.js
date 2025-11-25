import * as outputApi from '@/api/output';

const state = {
  outputs: [],
  isLoading: false,
  error: null,
};

const mutations = {
  SET_OUTPUTS(state, outputs) {
    state.outputs = outputs;
  },
  ADD_OUTPUT(state, output) {
    state.outputs.push(output);
  },
  UPDATE_OUTPUT(state, updatedOutput) {
    const index = state.outputs.findIndex(o => o.id === updatedOutput.id);
    if (index !== -1) {
      state.outputs.splice(index, 1, updatedOutput);
    }
  },
  DELETE_OUTPUT(state, id) {
    state.outputs = state.outputs.filter(o => o.id !== id);
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchOutputs({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const outputs = await outputApi.getAllOutputs();
      commit('SET_OUTPUTS', outputs);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addOutput({ commit }, output) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const newOutput = await outputApi.createOutput(output);
      commit('ADD_OUTPUT', newOutput);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async updateOutput({ commit }, { id, output }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const updatedOutput = await outputApi.updateOutput(id, output);
      commit('UPDATE_OUTPUT', updatedOutput);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async deleteOutput({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      await outputApi.deleteOutput(id);
      commit('DELETE_OUTPUT', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  allOutputs: (state) => state.outputs,
  outputById: (state) => (id) => state.outputs.find(o => o.id === id),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
