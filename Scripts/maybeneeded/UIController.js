define(function(){
    // 引用StateMachine？
    var controller = function(app){
        document.getElementById('login-opener').addEventListener('click',login_open,false);
        function login_open() {
            document.getElementById('login-div').hidden = false;
            document.getElementById('register-div').hidden = true;
        }
        document.getElementById('register-opener').addEventListener('click',register_open,false);
        function register_open() {
            document.getElementById('register-div').hidden = false;
            document.getElementById('login-div').hidden = true;
        }
        document.getElementById('register').addEventListener('click',register,false);
        function register(event){
            var email = document.getElementById('register-email').value;
            var password = document.getElementById('register-password').value;
            //app.register(email,password);
        }
        document.getElementById('login').addEventListener('click',login,false);
        function login(event){
            var email = document.getElementById('login-email').value;
            var password = document.getElementById('login-password').value;
            //app.login(email,password);
        }
        function loginDone() {
            document.getElementById('register-login').hidden = true;
            document.getElementById('logout').hidden = false;
        }
        
        document.getElementById('logout').addEventListener('click',logout,false);
        function logout(){
            //app.logout();
        }
        function logoutDone() {
            document.getElementById('register-login').hidden = false;
            document.getElementById('logout').hidden = true;
        }
        document.getElementById('AddBox').addEventListener('click',AddRandomBox,false);
        function AddRandomBox(){
            console.log('AddBox!');
            //app.addrandombox();
        }
    }

    return controller;
});