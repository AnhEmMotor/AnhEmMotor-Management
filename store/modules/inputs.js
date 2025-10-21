import * as inputApi from '@/api/input';

const state = {
  inputs: [],
  isLoading: false,
  error: null,
};

const mutations = {
  SET_INPUTS(state, inputs) {
    state.inputs = inputs;
  },
  ADD_INPUT(state, input) {
    state.inputs.push(input);
  },
  UPDATE_INPUT(state, updatedInput) {
    const index = state.inputs.findIndex(i => i.id === updatedInput.id);
    if (index !== -1) {
      state.inputs.splice(index, 1, updatedInput);
    }
  },
  DELETE_INPUT(state, id) {
    state.inputs = state.inputs.filter(i => i.id !== id);
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchInputs({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const inputs = await inputApi.getAllInputs();
      commit('SET_INPUTS', inputs);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addInput({ commit }, input) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const newInput = await inputApi.createInput(input);
      commit('ADD_INPUT', newInput);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async updateInput({ commit }, { id, input }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const updatedInput = await inputApi.updateInput(id, input);
      commit('UPDATE_INPUT', updatedInput);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async deleteInput({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      await inputApi.deleteInput(id);
      commit('DELETE_INPUT', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  allInputs: (state) => state.inputs,
  inputById: (state) => (id) => state.inputs.find(i => i.id === id),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
