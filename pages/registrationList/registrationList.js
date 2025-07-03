Page({
  data: {
    loading: true,
    registrations: [], // 报名信息列表
    allRegistrations: [], // 所有报名信息（用于筛选）
    searchKeyword: '', // 搜索关键词
    filterType: 'all', // 筛选类型：all-全部，name-按姓名，contact-按联系方式
    showDetailModal: false, // 是否显示详情弹窗
    currentRegistration: null // 当前查看的报名信息
  },

  onLoad: function() {
    // 页面加载时获取报名列表
    this.fetchRegistrationList();
  },

  // 获取报名列表
  fetchRegistrationList: function() {
    const that = this;
    
    // 从本地存储中获取openid
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '未获取到用户信息',
        icon: 'none'
      });
      that.setData({
        loading: false
      });
      return;
    }
    
    // 调用接口获取报名列表
    wx.request({
      // url: 'https://activityregistration.weimeigu.com.cn/registration/list',
      url: 'http://localhost:8788/registration/list',
      method: 'GET',
      data: {
        openid: openid
      },
      success: function(res) {
        if (res.data && Array.isArray(res.data)) {
          // 处理数据，将selectedDates字符串转为数组
          const registrations = res.data.map(item => {
            // 将英文逗号分隔的字符串转为数组
            const selectedDatesArray = item.participation_date ? item.participation_date.split(',') : [];
            return {
              ...item,
              selectedDatesArray: selectedDatesArray
            };
          });
          
          that.setData({
            registrations: registrations,
            allRegistrations: registrations,
            loading: false
          });
        } else {
          that.setData({
            registrations: [],
            allRegistrations: [],
            loading: false
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '获取报名列表失败',
          icon: 'none'
        });
        that.setData({
          loading: false
        });
      }
    });
  },

  // 输入搜索关键词
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 点击搜索按钮
  onSearch: function() {
    this.filterRegistrations();
  },

  // 设置筛选类型
  setFilter: function(e) {
    const filterType = e.currentTarget.dataset.type;
    this.setData({
      filterType: filterType
    });
    this.filterRegistrations();
  },

  // 根据筛选条件过滤报名信息
  filterRegistrations: function() {
    const { allRegistrations, searchKeyword, filterType } = this.data;
    
    if (!searchKeyword) {
      // 如果没有搜索关键词，显示所有数据
      this.setData({
        registrations: allRegistrations
      });
      return;
    }
    
    // 根据筛选类型和关键词过滤数据
    let filteredRegistrations = [];
    
    switch (filterType) {
      case 'name':
        // 按姓名筛选
        filteredRegistrations = allRegistrations.filter(item => 
          item.name && item.name.indexOf(searchKeyword) > -1
        );
        break;
        
      case 'contact':
        // 按联系方式筛选
        filteredRegistrations = allRegistrations.filter(item => 
          item.contact && item.contact.indexOf(searchKeyword) > -1
        );
        break;
        
      default:
        // 全部筛选（姓名或联系方式）
        filteredRegistrations = allRegistrations.filter(item => 
          (item.name && item.name.indexOf(searchKeyword) > -1) || 
          (item.contact && item.contact.indexOf(searchKeyword) > -1)
        );
        break;
    }
    
    this.setData({
      registrations: filteredRegistrations
    });
  },

  // 显示报名详情
  showDetail: function(e) {
    const registrationId = e.currentTarget.dataset.id;
    const registration = this.data.registrations.find(item => item.id === registrationId);
    
    if (registration) {
      this.setData({
        currentRegistration: registration,
        showDetailModal: true
      });
    }
  },

  // 隐藏报名详情
  hideDetail: function() {
    this.setData({
      showDetailModal: false,
      currentRegistration: null
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      loading: true,
      searchKeyword: '',
      filterType: 'all'
    });
    this.fetchRegistrationList();
    wx.stopPullDownRefresh();
  }
}) 