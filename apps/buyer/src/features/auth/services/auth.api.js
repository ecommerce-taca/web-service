export const authApi = {
  login: async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication
        if (credentials.identifier && credentials.password) {
          resolve({
            id: '1',
            name: 'Minh Anh',
            email: credentials.identifier.includes('@') ? credentials.identifier : 'minhanh@taca.com',
            phone: credentials.identifier.includes('@') ? null : credentials.identifier,
          });
        } else {
          reject(new Error('Vui lòng nhập đầy đủ thông tin.'));
        }
      }, 1000);
    });
  },

  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.name && userData.identifier && userData.password) {
          resolve({
            id: '2',
            name: userData.name,
            email: userData.identifier.includes('@') ? userData.identifier : null,
            phone: userData.identifier.includes('@') ? null : userData.identifier,
          });
        } else {
          reject(new Error('Vui lòng điền đầy đủ thông tin.'));
        }
      }, 1000);
    });
  }
};
