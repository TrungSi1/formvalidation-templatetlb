// hàm thực thi chính
//đối tượng Validator
function Validator(options) {

    //khai báo object lưu lại tất cả các rule được quét
    const selectorRules = {};

    //hàm con
    //hàm lấy ra thẻ cha của thẻ input, thẻ cha này phải chứa thẻ message để mình hiện thông báo ra
    function selectFormGroup (element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
           element = element.parentElement;
        };
    };

    function selectMessage (inputElement) {
        // lấy thẻ thẻ form-message chung group thẻ input vừa blur để ghi cái errorMessage ra
         // đứng từ thẻ bị blur lấy ra thẻ cha nó sau đó select tới thẻ form-message trong group đó
         return selectFormGroup(inputElement, options.formGroup).querySelector(options.errorSelector);
    };

    function validate(inputElement, rule) {
       
        //inputElement.value trả ra cái người dùng nhập vào
        // rule.test trả ra funtion test
         const errorElement = selectMessage(inputElement);
         var errorMessage;
         const rules = selectorRules[rule.selector];// lấy tất cả các rule mà của cái thẻ input được selector

        // lặp kiểm tra từng rule
        for(let i=0; i < rules.length; i++){
            switch(inputElement.type){
                // nếu input là radio hoặc chackbox thì 
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked') //select tới value được check
                    ); //rules[i] là một funtion vậy nên tryền tham số vào là value
                    break;
                default:
                    //nếu input là nhập thì
                    errorMessage = rules[i](inputElement.value); //rules[i] là một funtion vậy nên tryền tham số vào là value
            }
            if(errorMessage) break; // nếu phát hiện lỗi thì thoát lặp
        }
       
        //lấy giá trị errorMessage từ vòng for trên ra render
         if(errorMessage) {
           errorElement.innerText = errorMessage;
           selectFormGroup(inputElement, options.formGroup).classList.add('invalid'); //thêm css màu vô
         }
         else {
           errorElement.innerText = '';
           selectFormGroup(inputElement, options.formGroup).classList.remove('invalid');// bỏ thêm css màu
        }       
        // nếu nhập đúng thì errorMessage là undifined mà kiểu boolen là false   
        // nếu nhập sai thì errorMessage là chuỗi messeag mà kiểu boolen là true    
        return !errorMessage 
    };

    //thực thi chương trình
    // options là đối số truyền vào khi gọi hàm Validator bên code HTML
    // select tới form cần validate
    var formElement = document.querySelector(options.form); // option.form = '#form-1'
    if(formElement) {

        //!sự kiện submit --------------------------------------------------
        // kiểm tra form được nhập hay chưa
        formElement.onsubmit = (e) => {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach((rule) => {
                const inputElement = formElement.querySelector(rule.selector)
                const isErrorMessage = validate(inputElement, rule);
            
                if(!isErrorMessage){ //nếu có lỗi
                 isFormValid = false;
                }
            });
        
            // nếu không có lỗi thì thực hiện hàm onSubmit
            if(isFormValid){ 
                //submit bằng javascript
                if(typeof options.onSubmit === 'function'){
                    // lấy các thẻ input có attribute là name và không có disable
                    const enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    //query All sẽ cho ra một Nodelist nên cần chuyển về array
                    //dùng reduce để tạo object mới có các key là name và item là value của các thẻ input được lọc qua
                    const formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':
                                //key là input.name và item là value của ratio inut được check
                                values[input.name] = document.querySelector('input[name="'+input.name+'"]:checked').value;
                                break;
                            case 'checkbox':
                                //chỉ lấy của ô được check
                                if(!input.matches(':checked')) {
                                    // values[input.name] = ''; // chuỗi rỗng khi không check
                                    return values;
                                }

                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []; //gán value thành mảng
                                }
                                values[input.name].push(input.value); 
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] =input.value;
                        }
                        return  values;
                    }, {} );   
                    options.onSubmit(formValues);
                }
                //submit bằng mặc định HTML
                else{
                    formElement.submit();
                }
            
            }
        };

        //!sự kiện bler--------------------------------------------------
        //lấy ra những cái luật được đưa vào rules khi gọi hàm hên HTML
        options.rules.forEach((rule) => { //rule là 2 object được return từ Validator.isRequired && isEmail

            //lưu lại tất cacr các rule cho mỗi input, để khi một input có 2 rule trở lên thì nó vẫn nhận được hết
            //nếu không có thì nó chỉ lấy cái rule ở sau 
            if(Array.isArray(selectorRules[rule.selector])){
                //thực thi dòng này ở vòng quét thứ 2 trên cái rule đó
                //nếu cái key rule.selector của object selectorRules là mảng thì push thêm vào
                selectorRules[rule.selector].push(rule.test);
            }
            else{
                //bắt đầu thì đk sẽ false nên thực thi dòng này
                // gán key rule.selector của object selectorRules là mảng rule.test
                selectorRules[rule.selector] = [rule.test] ;
            };
            //dùng formElement vì cần lấy trong thẻ form vì đôi khi trong document sẽ có nhiều form có #fullname || email
            //lấy ra ô input tương ứng của cái luật đó
            // dùng query All formgroup ratio có nhiều thẻ name trùng nhau dó đó nếu lấy 1 cái thì nó chỉ lấy được cái đầu tiên
            const inputElement = formElement.querySelectorAll(rule.selector);
            //chuyển thành array và lọc qua từng cái thẻ input nhận được
            Array.from(inputElement).forEach((inputElement) => {
                    //sự kiện blur ra khỏi input
                    inputElement.onblur = () => {
                      validate(inputElement, rule); //hàm xác nhận người dùng nhập đúng yêu cầu chưa
                    }
                    //sự kiện nhập vào input bỏ trạng thái lỗi
                    inputElement.oninput = () => {
                        const errorElement = selectMessage(inputElement);
                        errorElement.innerText = '';
                        selectFormGroup(inputElement, options.formGroup).classList.remove('invalid');// bỏ thêm css màu
                    };
            })
        })
    };
    
};

//-----------------------------------------------------------------------------------------------------------------------------------------
// hàm test nhận value input vào kiểm tra xem có hợp lệ chưa
// hàm yêu cầu không được để trống
Validator.isRequired = function (selector, message) { //selector = "#fullname"
    return {
        selector: selector,
        test: function (value) {
            // return value.trim() ? undefined : message ||  'Vui lòng nhập trường này' ;// trim để bỏ khoảng trắng 2 đầu hoặc khi người dùng nhập khoảng trắng không
            return value ? undefined : message ||  'Vui lòng nhập trường này' ;
        } 
    };
};
// hàm yêu cầu nhập đúng định dạng email
Validator.isEmail = function (selector, message) { //selector = "#email"
    return {
            selector: selector,
            test: function (value) {
                //kiểm tra cái người dùng nhập đúng là email không
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined : message || 'Trường này phải là email';
            } 
        };
};
// hàm yêu cầu độ dài tối thiểu
Validator.minLength = function (selector, min, message) { //selector = "#email"
    return {
            selector: selector,
            test: function (value) {
                return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
            } 
        };
};
// hàm xem nhập lại đúng chưa
// tham số message là để mình costom cái thông báo khi không muốn lấy mặc định
Validator.isConfirmed = function (selector, getConfirmValue, message) { 
    return {
            selector: selector,
            test: function (value) {
                return value === getConfirmValue() ? undefined : message || 'Nội dung nhập chưa đúng';
            } 
        };
};