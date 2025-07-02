Page({
  data: {
    batches: [], // 存储报名批次列表
    loading: true
  },

  onLoad: function() {
    // 加载报名批次数据
    this.fetchBatches();
  },

  // 获取报名批次数据
  fetchBatches: function() {
    const that = this;
    wx.request({
      // url: 'https://activityregistration.weimeigu.com.cn/batches',
      url: 'http://localhost:8788/batches', // 获取报名批次的接口
      method: 'GET',
      success: function(res) {
        that.setData({
          batches: res.data || [],
          loading: false
        });
      },
      fail: function() {
        that.setData({
          loading: false
        });
        wx.showToast({
          title: '获取报名批次失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择报名批次
  selectBatch: function(e) {
    const batchId = e.currentTarget.dataset.id;
    const batchName = e.currentTarget.dataset.name;
    
    // 跳转到报名表单页面，并传递批次ID和名称
    wx.navigateTo({
      url: `/pages/registrationForm/registrationForm?batchId=${batchId}&batchName=${batchName}`
    });
  }
}) 