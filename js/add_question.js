// JavaScript Document
list = new Array();//存储各科目章节信息
$(document).ready(
	function(){
		setSummernote();//初始化富文本
		sendEmptyJson();//获取科目信息
		isEdit();		
	}
)
function setEditType(type,data){
	/*var subject_id = data['subject']['id'];
	var subject_name = data['subject']['name'];
	var chapter = data.chapter;
	var degree = data.degree;
	var description = data.description;*/
	var answer = data.answer;
	$("#type").empty();
	switch(type){
		case "J":{
			$("#type").append("<option value='J' selected>判断题</option>");
			//$("#judge_description").summernote('code',description);
			if(answer=="T"){
				$("#judge_answer").val("T");
			}
			else $("#judge_answer").val("F");
			break;
		};
		case "S":{
			$("#type").append("<option value='S' selected>单选题</option>");
			break;
		};
		case "M":{
			$("#type").append("<option value='M' selected>多选题</option>");
			break;
		};
		case "F":{
			$("#type").append("<option value='F' selected>填空题</option>");
			break;
		};
		case "W":{
			$("#type").append("<option value='W' selected>阅读程序写结果</option>");
			break;
		};
		case "P":{
			$("#type").append("<option value='P' selected>程序题</option>");
			break;
		};
		default:{
			alert("没有题型"+type);
			break;
		};
	};
	setType();
}
//判断是否传入了编辑题目的参数
function isEdit(){
	var id = getUrlParam("id");
	var type = getUrlParam("type");
	console.log(id+" "+type);
	if(id != null && type != null) { // 编辑题目
		var quest = {
			id:id,
			type:type
		};
		$.ajax({ // 向后台请求题目
			data:quest,
			dataType:"JSON",
			url:"test.php",
			//url:"./ret_problem",
			type:"POST",
			success:function(msg){
				//判断type，设置不同的selected和summernote
				console.log(typeof msg+" "+msg);
				if(msg.status!=0){
					alert("have a problem:"+msg.error);
				}
				else {
					var data = msg.content;
					//var data = msg;
					/*var subject_id = data['subject']['id'];
					var subject_name = data['subject']['name'];
					var chapter = data.chapter;
					var degree = data.degree;
					var description = data.description;
					var answer = data.answer;*/
					setEditType(type,data);

				}
			},
			error:function(msg){
				//
				console.log("error code:"+msg.status);
			}
		})
	}
	/*var id = '{$id}';
	var type = '{$type}';
	console.log(id+" "+type);
	if(id!=null&&type!=null){
		var quest = {
			id:id,
			type:type
		}
		$("#type").empty();
		switch(type){
			case "J":{
				$("#type").append("<option value='judge' selected>判断题</option>");
				break;
			};
			case "S":{
				$("#type").append("<option value='single' selected>单选题</option>");
				break;
			};
			case "F":{
				console.log("F");
				$("#type").append("<option value='multiple' selected>多选题</option>");
				break;
			}
			case "W":{
				console.log("W");
				$("#type").append("<option value='fills' selected>填空题</option>");
				break;
			}
			case "P":{
				console.log("P");
				$("#type").append("<option value='wrires' selected>阅读程序写结果</option>");
				break;
			}
			default:{
				console.log("J");
				$("#type").append("<option value='program' selected>程序题</option>");
				break;
			}
		}
		$.ajax({
			data:quest,
			dataType:"JSON",
			url:"./ret_problem",
			type:"POST",
			success:function(msg){
				alert("get question");
				console.log(typeof msg+" "+msg);
			},
			error:function(msg){
				alert("error code:"+msg.status);
			}
		});*/
	
}
//匹配id和type
function getUrlParam(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = location.search.substring(1).match(reg);
        if(r != null) return decodeURI(r[2]);
        return null;
    }
// 发送空json获得科目信息
function sendEmptyJson(){
	var empty = {};//空json
	$.ajax({
		data:empty,
		type:'POST',
		//url:"./index.php/Home/Index/subject",//得到各科目章节信息的url
		url:"test.php",
		dataType:"json",
		success:function(data){
			alert(data.status);
			if (data.status==0) {
				data = data.subject;
				console.log(data.length);//////科目数量
				for (var i = 0; i < data.length; i++) {//加载科目
					$("#subject").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
					list[i]=new Array();//每个科目都是一个数组
					list[i][0]=data[i].one;//每个科目判断是否有上下册
					if (data[i].two!=null) {///////判断是否有下册
						list[i][1]=data[i].two;
					}
					else list[i][1]=0;
					//console.log(list[i]);
				}
			}
			else alert(data.error);//获取科目不成功的原因是.error吗？
		},
		error:function(msg){
			alert("未获取到科目信息:"+msg.status);
			console.log(msg);
		}
	});
}
function setSummernote(){////////富文本编辑器配置
	$('.summernote').summernote({
		lang:'zh-CN',
		width:800,
		height:100,
		minHeight:50,
		maxHeight:500,
		focus:true,
		disableDragAndDrop: true,
		callbacks: {
			onImageUpload: function(files) {
				sendFile(files,this);
			},
			onPaste: function (ne) {//   粘贴时取消格式
				var bufferText = ((ne.originalEvent || ne).clipboardData || window.clipboardData).getData('Text/plain');
                //    ne.preventDefault();  
                ne.preventDefault ? ne.preventDefault() : (ne.returnValue = false);
                // Firefox fix
                setTimeout(function () {
                	document.execCommand("insertText", false, bufferText);
                }, 10);
            }
        }
    });
	
}
function sendFile(files, event) {//////上传图片到服务器
	var data = new FormData();
    var length = files.length;
    console.log(length);
    for (var i = 0; i < length; i++) {
        data.append("file"+i, files[i]);
    }
    $.ajax({
    	data: data,
        type: "POST",
        //url: "./Index/upload", //图片上传出来的url，返回的是图片上传后的路径，http格式  
        url:"test.php",
        cache: false,
        contentType: false,
        processData: false,
        dataType: "json",
        success: function(data) { //data是返回的hash,key之类的值，key是定义的文件名
        	/*var type_val = document.getElementById("type").value;
            if(type_val=="judge"){
            	$('#judge_description').summernote('insertImage', data.url);
            }
            else if(type_val=="single"){
            	$('#single_description').summernote('insertImage', data.url);
            }
            else if(type_val=="multiple"){
            	$('#multiple_description').summernote('insertImage', data.url);
            }
            else if(type_val=="fills"){
            	$('#fills_description').summernote('insertImage', data.url);
            }
            else if(type_val=="wrires"){
            	$('#wrires_description').summernote('insertImage', data.url);  
            }
            else if(type_val=="program"){
            	$('#program_description').summernote('insertImage', data.url);
            }
            */
            if($("#"+event.id+"")!=null)
            	console.log("get");
            else
            	console.log("cannot get");
            $("#"+event.id).summernote('insertImage', data.url);
            console.log(data.key);
            
        },
        error: function(msg) {
        	alert("上传失败" + msg);
        	console.log(msg);
        }
    });
}
        
function changeSubject(){/////////////动态改变章节
	var checkText=parseInt($("#subject").val());
	console.log(checkText);
	$("#chapter").empty();//删除别的科目的章节信息
	////////添加上册
	$("#chapter").append("<optgroup label='上册'>");
	console.log(list[checkText-1].length+" "+list[checkText-1][0]);
	var one = list[checkText - 1][0];
	for (var i = 1; i <= list[checkText-1][0]; i++) {//
		$("#chapter").append("<option value='"+i+"'>"+i+"</option>");
	}
	if(list[checkText-1][1]!=0){////////判断该科目是否有下册
		/////////添加下册
		$("#chapter").append("</optgroup><optgroup label='下册'>");
		for (var i = 1; i <= list[checkText-1][1]; i++) {
			var valu = parseInt(one) + parseInt(i);
			$("#chapter").append("<option value='"+valu+"'>"+valu+"</option>");
		}
	}
	$("#chapter").append("</optgroup>");
}
function setType() {//////////选择题目题型
	var type = document.getElementById("type");
	var val = type.value;
	var judge=document.getElementById("judge");
	var single=document.getElementById("single");
	var multiple=document.getElementById("multiple");
	var fills=document.getElementById("fills");
	var wrires=document.getElementById("wrires");
	var program=document.getElementById("program");
	var degree_select = document.getElementById("degree_select");
	console.log(val);

	switch(val){
		case "J":{
			judge.style.display="";
			single.style.display="none";
			multiple.style.display="none";
			fills.style.display="none";
			wrires.style.display="none";
			program.style.display="none";
			break;
		};
		case "S":{
			single.style.display="";
			judge.style.display="none";
			multiple.style.display="none";
			fills.style.display="none";
			wrires.style.display="none";
			program.style.display="none";
			break;
		};
		case "M":{
			multiple.style.display="";
			judge.style.display="none";
			single.style.display="none";
			fills.style.display="none";
			wrires.style.display="none";
			program.style.display="none";
			break;
		};
		case "F":{
			fills.style.display="";
			judge.style.display="none";
			single.style.display="none";
			multiple.style.display="none";
			wrires.style.display="none";
			program.style.display="none";
			break;
		};
		case "W":{
			wrires.style.display="";
			judge.style.display="none";
			single.style.display="none";
			multiple.style.display="none";
			fills.style.display="none";
			program.style.display="none";
			break;
		};
		case "P":{
			program.style.display="";
			judge.style.display="none";
			single.style.display="none";
			multiple.style.display="none";
			fills.style.display="none";
			wrires.style.display="none";
			//degree_select.style.display="none";
			break;
		};
		default:alert("没有题型！");
	}
}

function setSingleNum(){/////////添加单选题选项
	var num = parseInt($("#single_num").val());
	var single = $("#single");
	var old_option = $("#single #option");/////////先判断有没有旧的options，有则删除
	if(old_option)
		old_option.remove();
	var optionDiv = document.createElement('div');//创建option的div，设置id为option
	optionDiv.id = "option";
	for(var i=65;i<65+num;i++){
		var option = '<p>'+String.fromCharCode(i)+'：</p><div class="summernote" id="single_'+String.fromCharCode(i)+'"></div>';
		optionDiv.innerHTML += option;
	}
	optionDiv.innerHTML += '<p>答案(大写字母，如A)：</p><input class="answer input" type="text" name="single_answer" id="single_answer">';
	single.append(optionDiv);//添加option
	setSummernote();
}

function setMultipleNum(){/////////////添加多选题选项
	var num = parseInt($("#multiple_num").val());
	var multiple = $("#multiple");
	var old_option = $("#multiple #option");///////先判断有没有旧的options，有则删除
	if(old_option)
		old_option.remove();
	var optionDiv = document.createElement('div');//创建option的div，设置id为option
	optionDiv.id = "option";
	for(var i=65;i<65+num;i++){
		var option = '<p>'+String.fromCharCode(i)+'：</p><div class="summernote" id="multiple_'+String.fromCharCode(i)+'"></div>';
		optionDiv.innerHTML += option;
	}
	optionDiv.innerHTML += '<p>答案(大写字母，如ABC)：</p><input class="answer input" type="text" name="multiple_answer" id="multiple_answer">';
	multiple.append(optionDiv);//添加option
	setSummernote();
}

function setFillsNum(){/////////////////添加填空题空白
	var num = parseInt($("#fills_num").val());
	var multiple = $("#fills");
	var old_option = $("#fills #option");//先判断有没有旧的options，有则删除
	if(old_option)
		old_option.remove();
	var optionDiv = document.createElement('div');//创建option的div，设置id为option
	optionDiv.id = "option";
	for(var i=1;i<=num;i++){
		var option = '<p id="option">空'+i+'(请用中文;隔开可能的答案)：</p><div class="summernote" id="fills_'+i+'"></div>';
		optionDiv.innerHTML += option;
	}
	multiple.append(optionDiv);//添加option
	setSummernote();
}

function selectFile(){////////////选择程序题文件
	var obj = document.getElementById("files");
	var file_length = obj.files.length;////////文件个数
	console.log(file_length);
	var file_name = document.getElementById("file_name");
	file_name.innerHTML="已选文件：";
	for (var i = 0; i < file_length; i++) {
		file_name.innerHTML+=obj.files[i].name+" ";
	}
}
function onlyNumber(e){////////////选项数只能输入数字
    if(/\D/.test(e.value)){
    	alert('只能输入数字');
    	e.value='';
    }
}

function upload(){///////////////上传题目信息
	var type = document.getElementById("type");
	var val = type.value;
	var subject = $("#subject").val();//取selected的value
	var chapter = parseInt($("#chapter").val());
	if (subject==null&&chapter==null) {
		alert("请选择科目和章节！");
		return false;
	}
	var degree = parseFloat($("#degree").val());//难度系数
	
	if(val=="P"){////////////////编程题
		var x = $("#program .input");
		var y = $("#program .summernote");
		for(var i=0;i<x.length;i++){
			if(x[i].value==""){
				console.log(x[i].id+" blank");
				alert("You should not leave any blanks!");
				return false;
			}
		}
		for(var i=0;i<y.length;i++){
			if($(y[i]).summernote('code')==""||$(y[i]).summernote('code')=="<br>"
						||$(y[i]).summernote('code')=="<p><br></p>"){
				console.log(y[i].id+" blank");
				alert("You should not leave any blanks!");
				return false;
			}
		}
		/*var title = $("#program_title").val().replace(/\n|\r\n/g,"<br>");
		var description = $("#program_description").val().replace(/<\/p><p>/g,'<br>');
        var description = description.replace(/<p>|<\/p>/g,"");
        var input = $("#input").val().replace(/\n|\r\n/g,"<br>");
        var output = $("#output").val().replace(/\n|\r\n/g,"<br>");
        var sample_input = $("#sample_input").val().replace(/\n|\r\n/g,"<br>");
        var sample_output = $("#sample_output").val().replace(/\n|\r\n/g,"<br>");
        var keywords = $("#keywords").val();*/
        var title = $("#program_title").summernote('code');
        var description = $("#program_description").summernote('code');
        var input = $("#input").summernote('code');
        var output = $("#output").summernote('code');
        var sample_input = $("#sample_input").summernote('code');
        var sample_output = $("#sample_output").summernote('code');
        var keywords = $("#keywords").summernote('code');
        var hint = $("#hint").val();
        var time_limit = $("#time_limit").val();
        var memory_limit = $("#memory_limit").val();
        //////////上传文件
        var obj = document.getElementById("files");
		var file_length = obj.files.length;////////文件个数
		var file_name = document.getElementById("file_name");

        var dataForm = new FormData();
        if(file_length!=0){
        	for (var i = 0; i < file_length; i++) {
        		dataForm.append("files["+i+"]",$("#files")[0].files[i]);
        	}        
        }
        dataForm.append("subject",subject);
        dataForm.append("chapter",chapter);
        dataForm.append("degree",degree);
        dataForm.append("title",title);
        dataForm.append("description",description);
        dataForm.append("input",input);
        dataForm.append("output",output);
        dataForm.append("sample_input",sample_input);
        dataForm.append("sample_output",sample_output);
        dataForm.append("keywords",keywords);
        dataForm.append("hint",hint);
        dataForm.append("time_limit",time_limit);
        dataForm.append("memory_limit",memory_limit);
        /*var json = {
			subject:subject,
			chapter:chapter,
			title:title,
			description:description,
			input:input,
			output:output,
			sample_input:sample_input,
			sample_output:sample_output,
			keywords:keywords,
			hint:hint,
			time_limit:time_limit,
			memory_limit:memory_limit
		};*/
		$.ajax({
			type: 'POST',
			url: "http://withcic.cn/MyOJ/Home/Index/newProblem",
			//url:"test.php",
			cache: false,
			data: dataForm,
			processData: false,
			contentType: false,
			success: function(data){
				alert(data.err_msg);
			},
			error:function(req,err,errobj) {
				/* Act on the event */
				console.log(req);
				console.log(err);
			}
		});
	}
	else{
		switch(val){
			case "J":{//////////////判断题
				console.log($("#judge_description").summernote('code'));
				var description = $("#judge_description").summernote('code');
        		//var description = description.replace(/<p>|<\/p>/g,"");.replace(/<\/p><p*>/g,'<br>')
        		if(description==""||description=="<br>"
        			||description=="<p><br></p>"){
        			console.log("judge_description blank");
        			alert("You should not leave any blanks!");
        			return false;
        		};
        		$("#showTest").html(description);
				var answer = $("#judge_answer").val();
				var json = {
					subject:subject,
					chapter:chapter,
					type:val,
					degree:degree,
					description:description,
					answer:answer
				};
				break;
			};
			case "S":{/////////////////单选题
				var x = $("#single .input");//选项数 答案
				var y = $("#single .summernote");//题目 选项内容
				for(var i=0;i<x.length;i++){
					if(x[i].value==""){
						console.log(x[i].id+" blank");
						alert("You should not leave any blanks!");
						return false;
					}/**/
				}
				for(var i=0;i<y.length;i++){
					if($(y[i]).summernote('code')==""||$(y[i]).summernote('code')=="<br>"
						||$(y[i]).summernote('code')=="<p><br></p>"){
						console.log(y[i].id+" blank");
						alert("You should not leave any blanks!");
						return false;
					}
				}
				/*var description = $("#single_description").val().replace(/<\/p><p*>/g,'<br>');
        		var description = description.replace(/<p>|<\/p>/g,"");*/
        		var description = $("#single_description").summernote('code');
				var answer = $("#single_answer").val();
				var num = parseInt($("#single_num").val());
				var json = {
					subject:subject,
					chapter:chapter,
					type:val,
					degree:degree,
					description:description,
					number:num,
					answer:answer,
					items:{}
				}
				for(var s=65;s<65+num;s++){
					var name = "single_"+String.fromCharCode(s);
					var content = $("#"+name).summernote('code');//document.getElementById(name).value
					json['items'][String.fromCharCode(s)]=content;
				}
				break;
			};
			case "M":{/////////////////多选题
				var x = $("#multiple .input");
				var y = $("#multiple .summernote");
				console.log(x.length+" "+y.length);
				for(var i=0;i<x.length;i++){
					if(x[i].value==""){
						console.log(x[i].id+" blank");
						alert("You should not leave any blanks!");
						return false;
					}
				}
				for(var i=0;i<y.length;i++){
					if($(y[i]).summernote('code')==""||$(y[i]).summernote('code')=="<br>"
						||$(y[i]).summernote('code')=="<p><br></p>"){
						console.log(y[i].id+" blank");
						alert("You should not leave any blanks!");
						return false;
					}
				}
				/*var description = $("#multiple_description").val().replace(/<\/p><p>/g,'<br>');
        		var description = description.replace(/<p>|<\/p>/g,"");*/
        		var description = $("#multiple_description").summernote('code');
				var answer = $("#multiple_answer").val();
				var num = parseInt($("#multiple_num").val());
				var json = {
					subject:subject,
					chapter:chapter,
					type:val,
					degree:degree,
					description:description,
					number:num,
					answer:answer,
					items:{}
				}
				for(var m=65;m<65+num;m++){
					var name = "multiple_"+String.fromCharCode(m);
					var content = $("#"+name).summernote('code');
					json['items'][String.fromCharCode(m)]=content;
				}
				break;
			};
			case "F":{///////////填空题
				var y = $("#fills .summernote");
				for(var i=0;i<y.length;i++){
					if($(y[i]).summernote('code')==""||$(y[i]).summernote('code')=="<br>"
						||$(y[i]).summernote('code')=="<p><br></p>"){
						console.log(y[i].id+" blank");
						alert("You should not leave any blanks!");
						return false;
					}
				}
				/*var description = $("#fills_description").val().replace(/<\/p><p>/g,'<br>');
        		var description = description.replace(/<p>|<\/p>/g,"");*/
        		var description = $("#fills_description").summernote('code');
				var num = parseInt($("#fills_num").val());
				if(num==""){
					console.log("fills_num blank");
        			alert("You should not leave any blanks!");
        			return false;
        		};
				var json = {
					subject:subject,
					chapter:chapter,
					type:val,
					degree:degree,
					description:description,
					number:num,
					answer:{}
				}
				for(var f=1;f<=num;f++){
					var name = "fills_"+f;
					var content = $("#"+name).summernote('code');
					var strs = new Array();
					strs = content.split("；");
					if(strs.length<=1)json['answer'][f-1]=content;
					else{
						json['answer'][f-1]={};
						for(var i=0;i<strs.length;i++){
							json['answer'][f-1][i]=strs[i];
						}
					}
				}
				break;
			};
			case "W":{//////////////阅读程序写结果
				var y = $("#wrires .summernote");
				for(var i=0;i<y.length;i++){
					if($(y[i]).summernote('code')==""||$(y[i]).summernote('code')=="<br>"
						||$(y[i]).summernote('code')=="<p><br></p>"){
						console.log(y[i].id+" blank");
						alert("You should not leave any blanks!");
						return false;
					}
				}
				/*var description = $("#wrires_description").val().replace(/<\/p><p>/g,'<br>');
        		var description = description.replace(/<p>|<\/p>/g,"");*/
        		var description = $("#wrires_description").summernote('code');
				var answer = $("#wrires_answer").summernote('code');
				var json = {
					subject:subject,
					chapter:chapter,
					type:val,
					degree:degree,
					description:description,
					answer:answer
				};
				break;
			};
			default:break;
		}
		$.ajax({
			type:"POST",
			data:json,
			//url:"/MyOJ/Home/Problem/newGeneral",//上传题目的url
			url:"test.php",
			dataType:"json",
			success: function(msg){
				if(msg!=''){
					if (msg.status == 0) { 
						alert("添加成功!") 
						clearQuestion();
					} 
					else alert(msg.error);
					console.log(msg);
				}
			}	,
			error: function(msg){
				alert(msg.error);//
				console.log(msg.error);
				clearQuestion();
			}
		});
	}
		$("#showTest").html("subject:"+subject+" chapter:"+chapter+" description:"+description+" type:"+val);
}

function clearQuestion(){
	//$(".question > input").val("");
	$(".summernote").each(//   富文本
		function(){
			$(this).summernote('code',"");
		}
	)
	$(".answer").val("");//选择题 填空题答案
	$(".program input").val("");$("#file_name").html("");//程序题
}