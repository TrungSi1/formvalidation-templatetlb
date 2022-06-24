//! phải xây dựng form theo đúng format

function Validator (formSelector, options={}){
    //khai báo 1 object chứa các rule 
    const formRules = {}; 
    //tạo ra các rule
    //quy ước;
    // nếu có lỗi thì return message lỗi
    // không có lỗi thì undefined
    const validatorRules = {
        //rule không bỏ trống
        required: function(value){
            return value ? undefined : "Vui lòng nhập trường này";
        },
        //rule phải đúng định dạng email
        email: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        },
        //rule độ dài tối thiểu
        min:function(min){
           return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        },
      
    };
   
    function selectParents(element){
        while(element.parentElement){// điều kiện là có cha
            if(element.parentElement.matches(".form-group")){
              return element.parentElement
            }
            element = element.parentElement
        } 
    }

    //lấy element form cần validate
    const formElement = document.querySelector(formSelector);
    
    if(formElement){

        //lấy ra một Nodelist là tất cả thẻ có attribute là name và rules
        const inputs = formElement.querySelectorAll('[name][rules]')
        //lặp qua Nodelist vừa tìm để lấy ra từng input Element 
        for(let input of inputs){

            // gán key = input.name và item là rules tương ứng trong input đó
            // formRules[input.name] = input.getAttribute('rules');

            // cắt các rule có dấu | thành từng cái riêng
            const rules = input.getAttribute('rules').split('|');

            //lặp qua các rule vừa lây để đưa các function tương ứng vào ob formRules
            /**
             * formRules = {
             *  email: (2) [ƒ, ƒ]  // có 2 func
                fullname: [ƒ]      
                password: (2) [ƒ, ƒ] }
             */
            for(let rule of rules){ 
                //khai báo cái rule có min là nó gồm dấu :
                const isRuleHasValue = rule.includes(':');
                var ruleInfo ;
                //!------------------trường hợp lặp gặp min:6-------------------
                if(isRuleHasValue){
                    //cắt cái rule có : ra 
                     ruleInfo = rule.split(':');
                    //sau khi cắt thì //! min là [0] còn 6 là [1]
                    rule = ruleInfo[0];
                }
                //!---------------------------------------------------------------
                // khai báo gọi tới func min
                var ruleFunc = validatorRules[rule] ;
                //!---------------------------------------------------------------
                if(isRuleHasValue){
                    // thực thi func min với đối số là 6 và gắn lại cho ruleFunc
                    // ruleFunc sẽ trở thành func trả về từ func min
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                //!---------------------------------------------------------------
                //biến cái ob validatorRules có các hàm tương ứng với các key
                if(Array.isArray( formRules[input.name])){
                    //lần lặp 2 nó vào đây vì lúc này nó đã là arr
                    // put thêm rule thứ 2 cho input có nhiều rule
                    formRules[input.name].push(ruleFunc);
                }
                else{ //lần đầu sẽ lọt vào đây vì nó không phải arr
                    //gán nó bằng arr 1 index là cái funtion tương ứng nó gọi được bằng rule
                    formRules[input.name] = [ruleFunc]
                };
            }
            //!lắng nghe các sự kiện như bler, onchange, .....
            input.onblur = handerValidate ;
            input.oninput = clearErrorStatus ;

        }

        //render trạng thái lỗi ra
        function handerValidate (e){
            const rules = formRules[e.target.name]
            var errorMessage;
            
            // lặp để thực thi các rule của một input 
            // trong một input có 2 func rule thì nếu func đầu sai thì break luôn không cần xét tiếp theo
            for(let rule of rules){
                errorMessage = rule(e.target.value)
                if(errorMessage) break;
            }
            const messageElement = selectParents(e.target).querySelector('.form-message');
            if(errorMessage){
                messageElement.innerText = errorMessage;
                selectParents(e.target).classList.add('invalid')
            }
            // nếu nhập đúng thì errorMessage là undifined mà kiểu boolen là false   
            // nếu nhập sai thì errorMessage là chuỗi messeag mà kiểu boolen là true      
            return !errorMessage
        }

        //bỏ trạng thái lỗi đi
        function clearErrorStatus(e){
            const messageElement = selectParents(e.target).querySelector('.form-message');
                messageElement.innerText = '';
                selectParents(e.target).classList.remove('invalid')
        }

         //! xử lí hành vi submit
         formElement.onsubmit = (e)=>{
            e.preventDefault();
            const inputs = formElement.querySelectorAll('[name][rules]')
            let isvalid = true;
           
            //lặp qua Nodelist vừa tìm để lấy ra từng input Element 
            for(let input of inputs){
               if(!handerValidate({ target: input})){
                 isvalid = false;
               }
            }
            if(isvalid){
                 if(typeof options.onSubmit === "function"){
                     // lấy các thẻ input có attribute là name và không có disable
                 const enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                 //query All sẽ cho ra một Nodelist nên cần chuyển về array
                 //dùng reduce để tạo object mới có các key là name và item là value của các thẻ input được lọc qua
                 const formValues = Array.from(enableInputs).reduce(function(values, input){
                     switch(input.type){
                         case 'radio':
                             //key là input.name và item là value của ratio inut được check
                             // values[input.name] = document.querySelector('input[name="'+input.name+'"]:checked').value;
                             break;
                         case 'checkbox':
                             //chỉ lấy của ô được check
                             // if(!input.matches(':checked')) {
                             //     // values[input.name] = ''; // chuỗi rỗng khi không check
                             //     return values;
                             // }

                             // if(!Array.isArray(values[input.name])){
                             //     values[input.name] = []; //gán value thành mảng
                             // }
                             // values[input.name].push(input.value); 
                             break;
                         case 'file':
                             // values[input.name] = input.files;
                             break;
                         default:
                             values[input.name] =input.value;
                      }
                         return  values;
                     }, {} );   
                     options.onSubmit(formValues);
                 }else
                 {
                     formElement.submit();
                 }
            }
        }
    }
}
