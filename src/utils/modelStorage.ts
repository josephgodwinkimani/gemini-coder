export const modelStorage = {
  saveModel: (modelName: string) => {
    localStorage.setItem('selectedModel', modelName);
  },

  loadModel: () => {
    return localStorage.getItem('selectedModel') || '';
  },

  validateSavedModel: (availableModels: string[]): string => {
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel && availableModels.includes(savedModel)) {
      return savedModel;
    }
    // If saved model is not available, clear it
    localStorage.removeItem('selectedModel');
    return '';
  },

  clearModel: () => {
    localStorage.removeItem('selectedModel');
  },
};
