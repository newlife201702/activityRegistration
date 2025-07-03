Page({
  data: {
    batchId: '', // 批次ID
    batchName: '', // 批次名称
    name: '', // 姓名
    gender: '', // 性别，男/女
    contact: '', // 联系方式
    idNumber: '', // 证件号码
    helper: '', // 帮抄人员
    dailyCompetitionTimes: [], // 所有可选的比赛日期
    selectedDates: [], // 已选择的比赛日期
    fee: 0, // 报名费用
    isAgree: false, // 是否同意参赛须知
    showSubmitConfirm: false, // 是否显示提交确认对话框
    showPayConfirm: false, // 是否显示支付确认对话框
    isSubmitted: false, // 是否已提交
    loading: true, // 加载状态
    genderOptions: ['男', '女'],
    openid: '' // 用户的openid
  },

  onLoad: function(options) {
    // 获取传递的批次ID和名称
    if (options.batchId && options.batchName) {
      this.setData({
        batchId: options.batchId,
        batchName: options.batchName
      });
      
      // 获取批次详情，包括比赛日期
      this.fetchBatchDetail(options.batchId);
      
      // 获取用户openid
      this.getUserOpenid();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 获取用户openid
  getUserOpenid: function() {
    const that = this;
    // 从本地存储中获取openid
    const openid = wx.getStorageSync('openid');
    if (openid) {
      that.setData({
        openid: openid
      });
    } else {
      // 如果没有获取到openid，则返回到活动页面重新获取
      wx.showToast({
        title: '未获取到用户信息，请重试',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack({
          delta: 2 // 返回到活动页面
        });
      }, 1500);
    }
  },

  // 获取批次详情
  fetchBatchDetail: function(batchId) {
    const that = this;
    wx.request({
      // url: `https://activityregistration.weimeigu.com.cn/batch/${batchId}`,
      url: `http://localhost:8788/batch/${batchId}`,
      method: 'GET',
      success: function(res) {
        if (res.data) {
          // 将比赛日期字符串转换为数组
          const dailyCompetitionTimes = res.data.daily_competition_time ? 
            res.data.daily_competition_time.split(',') : [];
          
          that.setData({
            dailyCompetitionTimes: dailyCompetitionTimes,
            loading: false
          });
        } else {
          wx.showToast({
            title: '获取批次详情失败',
            icon: 'none'
          });
          that.setData({
            loading: false
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '获取批次详情失败',
          icon: 'none'
        });
        that.setData({
          loading: false
        });
      }
    });
  },

  // 输入姓名
  onNameInput: function(e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 选择性别
  onGenderChange: function(e) {
    this.setData({
      gender: this.data.genderOptions[e.detail.value]
    });
  },

  // 输入联系方式
  onContactInput: function(e) {
    this.setData({
      contact: e.detail.value
    });
  },

  // 输入证件号码
  onIdNumberInput: function(e) {
    this.setData({
      idNumber: e.detail.value
    });
  },

  // 选择帮抄人员
  onHelperChange: function(e) {
    this.setData({
      helper: e.detail.value
    });
  },

  // 选择比赛日期
  onDateChange: function(e) {
    const dateIndex = e.currentTarget.dataset.index;
    const date = this.data.dailyCompetitionTimes[dateIndex];
    const selectedDates = [...this.data.selectedDates];
    
    // 检查是否已选择该日期
    const index = selectedDates.indexOf(date);
    if (index > -1) {
      // 如果已选择，则取消选择
      selectedDates.splice(index, 1);
    } else {
      // 如果未选择，则添加到已选择列表
      selectedDates.push(date);
    }
    
    // 计算费用：每项298元
    const fee = selectedDates.length * 298;
    
    this.setData({
      selectedDates: selectedDates,
      fee: fee
    });
  },

  // 切换是否同意参赛须知
  onAgreeChange: function(e) {
    this.setData({
      isAgree: e.detail.value
    });
  },

  // 验证表单
  validateForm: function() {
    if (!this.data.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.contact) {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.idNumber) {
      wx.showToast({
        title: '请输入证件号码',
        icon: 'none'
      });
      return false;
    }
    
    if (this.data.selectedDates.length === 0) {
      wx.showToast({
        title: '请选择参赛日期',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.helper) {
      wx.showToast({
        title: '请选择帮抄人员',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请阅读并同意参赛须知',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.openid) {
      wx.showToast({
        title: '获取用户信息失败，请重试',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 点击提交按钮
  onSubmit: function() {
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      showSubmitConfirm: true
    });
  },

  // 确认提交
  confirmSubmit: function() {
    const that = this;
    // 隐藏确认对话框
    this.setData({
      showSubmitConfirm: false
    });
    
    // 将selectedDates数组转换为英文逗号分隔的字符串
    const selectedDatesStr = that.data.selectedDates.join(',');
    
    // 调用提交接口
    wx.request({
      url: 'https://activityregistration.weimeigu.com.cn/registration/submit',
      // url: 'http://localhost:9999/registration/submit',
      method: 'POST',
      data: {
        batchId: that.data.batchId,
        name: that.data.name,
        gender: that.data.gender,
        contact: that.data.contact,
        idNumber: that.data.idNumber,
        helper: that.data.helper,
        selectedDates: selectedDatesStr,
        fee: that.data.fee,
        openid: that.data.openid
      },
      success: function(res) {
        if (res.data && res.data.success) {
          // 提交成功
          that.setData({
            isSubmitted: true
          });
          wx.showToast({
            title: '您已完成提交！请进行支付',
            icon: 'none'
          });
        } else {
          // 提交失败
          wx.showToast({
            title: res.data.message || '提交失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 取消提交
  cancelSubmit: function() {
    this.setData({
      showSubmitConfirm: false
    });
  },

  // 点击支付按钮
  onPay: function() {
    if (!this.data.isSubmitted) {
      wx.showToast({
        title: '请先提交报名信息',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showPayConfirm: true
    });
  },

  // 确认支付
  confirmPay: function() {
    const that = this;
    // 隐藏确认对话框
    this.setData({
      showPayConfirm: false
    });
    
    // 调用微信支付
    wx.request({
      url: 'https://activityregistration.weimeigu.com.cn/registration/pay',
      // url: 'http://localhost:9999/registration/pay',
      method: 'POST',
      data: {
        batchId: that.data.batchId,
        fee: that.data.fee,
        openid: that.data.openid
      },
      success: function(res) {
          if (res.data) {
          // 调用微信支付接口
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType || 'MD5',
            paySign: res.data.paySign,
            success: function() {
              wx.showToast({
                title: '您已完成报名！期待您的比赛',
                icon: 'none'
              });
              // 支付成功后返回首页
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/activity/activity'
                });
              }, 2000);
            },
            fail: function(err) {
              wx.showToast({
                title: '支付失败，请重试',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '获取支付参数失败',
            icon: 'none'
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '支付请求失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 取消支付
  cancelPay: function() {
    this.setData({
      showPayConfirm: false
    });
  }
}) 