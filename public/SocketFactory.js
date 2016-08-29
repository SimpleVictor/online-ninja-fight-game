(function(){
  
  angular.module("myApp")
  .factory({Socket:Socket});
  Socket.$inject = ['socketFactory'];
  
  
  function Socket(socketFactory){
    
    return socketFactory();
    
  };
  
})();