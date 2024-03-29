// Generated by CoffeeScript 1.7.1
(function() {
  var app, controllers;

  app = angular.module('pay', ['ngCookies', 'ui.bootstrap'], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    return $interpolateProvider.endSymbol(']]');
  });

  controllers = {};

  controllers.PayController = function($rootScope, $scope, $timeout, $modal) {
    $rootScope.discountRate = 1;
    $rootScope.couponCode = '';
    $scope.userName = userName;
    $scope.userType = userType;
    $scope.plan = null;
    ga('send', 'event', 'pay-page', "pv");
    $rootScope.openIfSuccessModal = function() {
      var modal;
      return modal = $modal.open({
        templateUrl: 'if-success-modal.html',
        controller: 'IfSuccessModalController',
        backdrop: 'static'
      });
    };
    $scope.choosePlan = function(plan, $event) {
      $scope.plan = plan;
      ga('send', 'event', 'pay-page', "choose-plan", plan);
      return $timeout(function() {
        return $rootScope.openIfSuccessModal();
      }, 1000);
    };
    return $scope.openCouponModal = function() {
      var modal;
      return modal = $modal.open({
        templateUrl: 'coupon-code.html',
        controller: 'CouponCodeModalController',
        backdrop: 'static'
      });
    };
  };

  controllers.IfSuccessModalController = function($scope, $modalInstance, $cookies, $http) {
    $scope.clickSuccess = function() {
      var outTradeNumber;
      outTradeNumber = $cookies.out_trade_no;
      if (outTradeNumber) {
        return $http({
          method: 'POST',
          url: '/pay/status',
          params: {
            out_trade_no: outTradeNumber
          }
        }).success(function(resp) {
          if (resp.status === 'ok') {
            return location.href = "/pay/return?out_trade_no=" + outTradeNumber;
          } else {
            return alert('您的支付尚未成功');
          }
        }).error(function(data, status) {
          return alert('网络错误，请稍后重试');
        });
      } else {
        return alert('您的支付尚未成功');
      }
    };
    $scope.clickClose = function() {
      return $scope.$close();
    };
    return $scope.clickFailed = function() {
      return $scope.$close();
    };
  };

  controllers.CouponCodeModalController = function($rootScope, $scope) {
    return $scope.close = function() {
      return $scope.$close();
    };
  };

  controllers.CouponFormController = function($rootScope, $scope, $http) {
    $scope.coupon_code = '';
    return $scope.attachCouponCode = function() {
      return $http.get('/pay/attach_coupon_code', {
        params: {
          code: $scope.coupon_code
        }
      }).success(function(resp) {
        if (resp.success) {
          $rootScope.discountRate = resp.data.discount_rate;
          $rootScope.couponCode = resp.data.code;
        } else {
          if (resp.error === 'CODE_NOT_LEGAL') {
            alert('邀请码无效');
          } else if (resp.error === 'CODE_NO_LEFT') {
            alert('邀请码已耗尽');
          } else {
            alert(resp.error);
          }
        }
        return $scope.$parent.$close();
      });
    };
  };

  app.controller(controllers);

}).call(this);
