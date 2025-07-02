Page({
  data: {
    isAdmin: false,
    loading: true,
    openid: ''
  },

  onLoad: function() {
    // 获取用户角色信息
    this.getOpenid();
  },

  // 获取用户的 openid
  getOpenid: function() {
    const that = this;
    // 调用微信登录接口
    wx.login({
      success: function(loginRes) {
        if (loginRes.code) {
          // 获取到登录凭证，调用后端接口获取 openid
          wx.request({
            // url: 'https://activityregistration.weimeigu.com.cn/getOpenid',
            url: 'http://localhost:8788/getOpenid',
            method: 'POST',
            data: {
              code: loginRes.code
            },
            success: function(res) {
              if (res.data && res.data.openid) {
                that.setData({
                  openid: res.data.openid
                });
                // 获取到 openid 后再获取用户角色
                that.getUserRole(res.data.openid);
              } else {
                that.setData({
                  loading: false
                });
                wx.showToast({
                  title: '获取用户信息失败',
                  icon: 'none'
                });
              }
            },
            fail: function() {
              that.setData({
                loading: false
              });
              wx.showToast({
                title: '获取用户信息失败',
                icon: 'none'
              });
            }
          });
        } else {
          that.setData({
            loading: false
          });
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      },
      fail: function() {
        that.setData({
          loading: false
        });
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取用户角色信息
  getUserRole: function(openid) {
    const that = this;
    // 调用接口获取用户角色信息，传入 openid
    wx.request({
      // url: 'https://activityregistration.weimeigu.com.cn/getuserInfo',
      url: 'http://localhost:8788/getuserInfo',
      method: 'GET',
      data: {
        openid: openid || that.data.openid
      },
      success: function(res) {
        // 假设接口返回的数据中有 role 字段，'admin' 表示管理员，其他值表示普通用户
        const isAdmin = res.data.role === 'admin';
        that.setData({
          isAdmin: isAdmin,
          loading: false
        });
      },
      fail: function() {
        // 请求失败时默认为普通用户
        that.setData({
          isAdmin: false,
          loading: false
        });
        wx.showToast({
          title: '获取角色信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 普通用户点击报名按钮
  handleRegister: function() {
    // 跳转到选择报名批次页面
    wx.navigateTo({
      url: '/pages/batchSelection/batchSelection'
    });
  },

  // 管理员查看报名按钮
  handleViewRegistrations: function() {
    // 跳转到报名列表页面
    wx.navigateTo({
      url: '/pages/registrationList/registrationList'
    });
  }
}) 