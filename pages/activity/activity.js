Page({
  data: {
    isAdmin: false,
    loading: true,
    openid: '',
    userRegistration: null,
    hasRegistered: false
  },

  onLoad: function() {
    // 获取用户角色信息
    this.getOpenid();
  },

  // 获取用户的 openid
  getOpenid: function() {
    const that = this;
    // 先尝试从本地存储获取 openid
    const storedOpenid = wx.getStorageSync('openid');
    if (storedOpenid) {
      that.setData({
        openid: storedOpenid
      });
      // 获取用户角色
      that.getUserRole(storedOpenid);
      return;
    }
    
    // 如果本地存储没有 openid，则调用微信登录接口
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
                // 将 openid 存储到本地存储中
                wx.setStorageSync('openid', res.data.openid);
                
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
        
        // 设置管理员状态
        that.setData({
          isAdmin: isAdmin,
          loading: false
        });
        
        // 如果不是管理员，处理用户报名信息
        if (!isAdmin) {
          // 检查是否有报名信息
          if (res.data && res.data.id) {
            // 如果有报名信息，处理日期数据
            let registration = res.data;
            
            // 将日期字符串转换为数组
            if (registration.participation_date && typeof registration.participation_date === 'string') {
              registration.selectedDatesArray = registration.participation_date.split(',');
            } else {
              registration.selectedDatesArray = [];
            }
            
            that.setData({
              userRegistration: registration,
              hasRegistered: true
            });
          } else {
            that.setData({
              hasRegistered: false
            });
          }
        }
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