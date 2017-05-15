var problems = new Array(); //存放加载过的问题id
var ques_checked = new Array(); //提交时存储被勾选的题目
var content = $('div.content')[0]; //右区域内容
var id = 'undefined'; //记录科目id
var subject_and_chapter = {}; //记录科目及其章节信息
var number_page = 10; //每页数据量
var letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var type = 'J';
var oldtype = 'J';
var types = ['J', 'S', 'M', 'F', 'W', 'P'];
var types_chinese = ['判断题', '单选题', '多选题', '填空题', '阅读程序写结果题', '程序题'];
var types_array = { 'J': '判断题', 'S': '单选题', 'M': '多选题', 'F': '填空题', 'W': '阅读程序写结果题', 'P': '程序题' };
var length_types = types.length;
var mouse = 0;
var subjects = new Array();
var length_subjects = 0;
$(document).ready(function() {
    var user = getUrlParam("user");
    console.log(user);
    if (user != null) {
        if (user != 'admin' && user != 'me') {
            $('body').html('');
            document.write('输入的URL有误：404'+user);
        }
    } else user = 'admin';
    $.ajax({
        type: 'POST',
        url: 'test.php',
        data: {},
        dataType: 'json',
        success: function(data) {
            if (data.status != 0) {
                show_error(data.error);
            } else {
                var ol = $('ol.list-group')[0];
                subjects = data.subject;
                length_subjects = subjects.length;
                for (var i = 0; i < length_subjects; i++) {
                    problems[subjects[i].id] = new Array();
                    subject_and_chapter[subjects[i].id] = {
                        'name': subjects[i].name,
                        'one': subjects[i].one,
                        'two': subjects[i].two
                    }
                    var li = $('<li></li>');
                    li.appendTo(ol);
                    li.append($('<button class="btn btn-primary" onclick="subject(this)" number=' + subjects[i].id + '>' + subjects[i].name + '</button>'));
                    $('<p></p>').appendTo(ol);
                }
            }
        },
        error: function(xhr) {
            show_error('HTTP状态码为：' + xhr.status);
        }
    });
});

//匹配user
function getUrlParam(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = location.search.substring(1).match(reg);
        if(r != null) return decodeURI(r[2]);
        return null;
    }

//改变单页显示量（默认10）
$('#set_number_page').on('click', function(e) {
    e.preventDefault();
    var get_number_page = $('#input_number_page').val();
    if (get_number_page == '') {
        number_page = 10;
        $('.' + type).trigger('click');
        return;
    } else if (get_number_page == '0' || isNaN(get_number_page)) {
        show_error('请输入大于0的整数');
        return;
    } else {
        number_page = get_number_page;
        $('.' + type).trigger('click');
    }
});

//监视章节改变
function change_chapter() {
    $('.' + type).trigger('click');
}

//点击题型按钮
var type_show = function(obj) {
    if ($('#show_info') != undefined) {
        $('#show_info').remove();
    }
    if (id == 'undefined') {
        if ($('#show_question') != undefined) {
            $('#show_question').remove();
        }
        if ($('#show_warning') != undefined) {
            $('#show_warning').remove();
        }
        show_warning();
    } else {
        type = obj.getAttribute('type');
        show_question();
    }
}



//点击科目按钮
function subject(obj) {
    if ($('#show_info') != undefined) {
        $('#show_info').remove();
    }
    id = obj.getAttribute('number');
    for (var i = 0; i < length_subjects; i++) {
        if (subjects[i]['id'] == id) {
            document.getElementsByClassName('navbar-brand')[0].innerHTML = subjects[i]['name'];
        }
    }
    var select_chapter = $('#select_chapter');
    select_chapter.html('');
    $('<option value="0">不筛选章节</option>').appendTo(select_chapter);
    $('<option value="u" style="color:blue">上册</option>').appendTo(select_chapter);
    for (var i = 1; i <= subject_and_chapter[id].one; i++) {
        $('<option value="' + i + '">第' + i + '章</option>').appendTo(select_chapter);
    }
    if (subject_and_chapter[id].two != null) {
        var first_of_two = parseInt(subject_and_chapter[id].one) + 1;
        var number_chapter = parseInt(subject_and_chapter[id].one) + parseInt(subject_and_chapter[id].two);
        $('<option value="d" style="color:blue">下册</option>').appendTo(select_chapter);
        for (var i = first_of_two; i <= number_chapter; i++) {
            $('<option value="' + i + '">第' + i + '章</option>').appendTo(select_chapter);
        }
    }
    for (var i = 0; i < length_types; i++) {
        problems[id][types[i]] = new Array();
    }
    oldtype = type;
    type = 'J';
    show_question();
}

var show_warning = function(type = '') {
    if ($('#show_question') != undefined) {
        $('#show_question').remove();
    }
    if ($('#show_warning') != undefined) {
        $('#show_warning').remove();
    }
    var alert_div = $('<div id="show_warning" class="alert alert-warning"></div>');
    alert_div.appendTo(content);
    $('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').appendTo(alert_div);
    var msg = ' Please select the subject on the left ...';
    var signal = 0;
    if (type != '') {
        for (var i = 0; i < length_types; i++) {
            if (type == types[i]) {
                msg = types_chinese[i];
                signal = 1;
                break;
            }
        }
        if (signal == 0) {
            show_error('出现未知题型(type)');
            return;
        }
        msg = "数据库无" + msg + "数据";
    }
    $('<strong>Warning:</strong><div>' + msg + '</div>').appendTo(alert_div);
}

var show_question = function(page_num = 1) {
    if ($('table')[0] != undefined) {
        var count = $('input.check_question').length;
        for (var i = 0; i < count; i++) {
            var question_id = $('input.check_question')[i].parentNode.nextSibling.innerHTML;
            if ($('input.check_question')[i].checked) {
                problems[id][oldtype][question_id] = 1;
            } else {
                problems[id][oldtype][question_id] = 0;
            }
        }
    }
    oldtype = type;
    if ($('#show_question') != undefined) {
        $('#show_question').remove();
    }
    if ($('#show_warning') != undefined) {
        $('#show_warning').remove();
    }
    $('#' + type).addClass('active');
    for (var i = 0; i < length_types; i++) {
        if (types[i] != type) {
            $('#' + types[i]).removeClass();
        }
    }
    var div_question = $('<div id="show_question"></div>');
    div_question.appendTo(content);
    $.ajax({
        type: 'POST',
        url: './ret_qid',
        data: {
            'subject': id,
            'type': type,
            'page': page_num,
            'number': number_page,
            'teacher': user,
            'chapter': $('#select_chapter').val()
        },
        dataType: 'json',
        success: function(data) {
            if (data.status == 5) {
                show_warning(type);
            } else if (data.status == 0) {
                //创建表单
                var table = $('<table class="table table-hover table-striped table-bordered"></table>');
                table.appendTo(div_question);
                //创建表单首行
                var thead = $('<thead></thead>');
                thead.appendTo(table);
                var tr_head = $('<tr></tr>');
                tr_head.appendTo(thead);
                var th1 = $('<th width="5%"></th>');
                th1.appendTo(tr_head);
                var select_all_th = $('<button type="button" class="btn btn-info" onclick="select_all(this)"></button>');
                select_all_th.appendTo(th1);
                var chapter_th = '<th width="10%">chapter</th>';
                if (type == 'P') var description_th = '<th width="15%">title</th><th width="30%">description</th>';
                else var description_th = '<th width="45%">description</th>';
                var degree_th = '<th width="10%">degree</th>';
                var teacher_th = '<th width="10%">teacher</th>';
                var edit_th = '<th width="10%">edit</th>';
                var delete_th = '<th width="10%">delete</th>';
                var th = chapter_th + description_th + degree_th + teacher_th + edit_th + delete_th;
                $(th).appendTo(tr_head);
                //创建表单体部
                var tbody = $('<tbody></tbody>');
                tbody.appendTo(table);
                var count = data.problems.length;
                var n = 0;
                var bechecked = new Array();
                for (var i = 0; i < count; i++) {
                    var tr = $('<tr></tr>');
                    tr.appendTo(tbody);
                    if (data.problems[i].degree == "-1") data.problems[i].degree = '未设置难度系数';
                    description = data.problems[i].description;
                    var td1 = $('<td></td>');
                    td1.appendTo(tr);
                    var checkbox = $('<input type="checkbox" class="check_question" style="width: 2em; height: 2em">');
                    checkbox.appendTo(td1);
                    $('<td style="display:none;">' + data.problems[i].id + '</td>').appendTo(tr);
                    $('<td>' + data.problems[i].chapter + '</td>').appendTo(tr);
                    if (type == 'P') $('<td>' + data.problems[i].title + '</td>').appendTo(tr);
                    $('<td>' + description + '</td>').appendTo(tr);
                    $('<td>' + data.problems[i].degree + '</td>').appendTo(tr);
                    $('<td title="教工id：' + data.problems[i].teacher.id + '">' + data.problems[i].teacher.name + '</td>').appendTo(tr);
                    $('<td><a href="javascript:void(0);" question_id="' + data.problems[i].id + '" question_type="' + type + '" style="color:blue;" onclick="edit_question(this)">编辑</a></td>').appendTo(tr);
                    $('<td><a href="javascript:void(0);" onclick="delete_question(this)" style="color:red;" question_id="' + data.problems[i].id + '" question_type="' + type + '">删除</a></td>').appendTo(tr);
                    if (problems[id][type][data.problems[i].id] == 1) {
                        bechecked[i] = 1;
                        n++;
                    }
                    checkbox.on('click', function() {
                        select_all_th.html(isCheckAll());
                    });
                }
                var checkboxs = $('input.check_question');
                for (var i = 0; i < count; i++) {
                    if (bechecked[i] == 1) {
                        checkboxs[i].checked = true;
                    }
                }
                if (n == count) select_all_th.html('反选');
                else if (n < count) select_all_th.html('全选');
                else show_error('show_question函数中全选/反选的判断发生错误(258行)');
                $('img').css('width', '15em');
                //创建页脚
                var pagination = $('<ul class="pagination">');
                pagination.appendTo(div_question);
                for (var i = 1; i <= data.page_num; i++) {
                    $('<li><a href="#" onclick="show_question(' + i + ')">' + i + '</a></li>').appendTo(pagination);
                }
                //创建确认按钮
                var submit = $('<button type="button" class="btn btn-lg btn-primary pull-right" onclick="submit()">确认组卷</button>');
                submit.appendTo(div_question);
                //创建取消按钮
                var reset = $('<button type="button" class="btn btn-lg btn-warning pull-right" onclick="reset()">取消所有勾选</button>');
                reset.appendTo(div_question);
            } else {
                show_error(data.error);
            }
        },
        error: function(xhr) {
            show_error('HTTP状态码为：' + xhr.status);
        }
    });
}

//全选/反选
function select_all(obj) {
    var checkboxs = $('input.check_question');
    var count = checkboxs.length;
    if (obj.innerHTML == "全选") {
        for (var i = 0; i < count; i++) {
            checkboxs[i].checked = true;
        }
        obj.innerHTML = "反选";
    } else if (obj.innerHTML == "反选") {
        for (var i = 0; i < count; i++) {
            checkboxs[i].checked = false;
        }
        obj.innerHTML = "全选";
    } else {
        show_error('select_all函数中全选/反选按钮发生错误');
    }
}

//检查复选框是否全被选中
function isCheckAll() {
    var checkboxs = $('input.check_question');
    var count = checkboxs.length;
    for (var i = 0, n = 0; i < count; i++) {
        checkboxs[i].checked && n++;
    }
    if (n == count) {
        return '反选';
    } else if (n < count) return '全选';
    else return false;
};

//提交函数
function submit() {
    if ($('table')[0] != undefined) {
        var count = $('input.check_question').length;
        for (var i = 0; i < count; i++) {
            var question_id = $('input.check_question')[i].parentNode.nextSibling.innerHTML;
            if ($('input.check_question')[i].checked) {
                problems[id][type][question_id] = 1;
            } else {
                problems[id][type][question_id] = 0;
            }
        }
    }
    ques_checked[id] = new Array();
    for (var i = 0; i < length_types; i++) {
        ques_checked[id][types[i]] = new Array();
        for (index in problems[id][types[i]]) {
            if (problems[id][types[i]][index] == 1) {
                ques_checked[id][types[i]][index] = 0;
            }
        }
    }
    var length_J = length_array(ques_checked[id]['J']);
    var length_S = length_array(ques_checked[id]['S']);
    var length_M = length_array(ques_checked[id]['M']);
    var length_F = length_array(ques_checked[id]['F']);
    var length_W = length_array(ques_checked[id]['W']);
    var length_P = length_array(ques_checked[id]['P']);
    var max_length = Math.max(length_J, length_S, length_M, length_F, length_W, length_P);
    if ($('#show_question') != undefined) {
        $('#show_question').remove();
    }
    var div_question = $('<div id="show_question"></div>');
    div_question.appendTo(content);
    var table = $('<table class="table table-hover table-striped table-bordered"></table>');
    table.appendTo(div_question);
    var thead = $('<thead></thead>');
    thead.appendTo(table);
    var tr_head = $('<tr><th width="16%">判断题</th><th width="16%">单选题</th><th width="16%">多选题</th><th width="16%">填空题</th><th>阅读程序写结果题</th><th width="16%">程序题</th></tr>');
    tr_head.appendTo(thead);
    var tbody = $('<tbody></tbody>');
    tbody.appendTo(table);
    var tr1 = $('<tr><td><button type="button" class="btn btn-primary" onclick="unite(1)">统一分数</button></td><td><button type="button" class="btn btn-primary" onclick="unite(2)">统一分数</button></td><td><button type="button" class="btn btn-primary" onclick="unite(3)">统一分数</button></td><td><button type="button" class="btn btn-primary" onclick="unite(4)">统一分数</button></td><td><button type="button" class="btn btn-primary" onclick="unite(5)">统一分数</button></td><td><button type="button" class="btn btn-primary" onclick="unite(6)">统一分数</button></td></tr>');
    tr1.appendTo(tbody);
    var tr = new Array(max_length);
    for (var i = 0; i < max_length; i++) {
        tr[i] = $('<tr></tr>');
        tr[i].appendTo(tbody);
        for (var j = 0; j < 6; j++) {
            var td = $('<td></td>');
            td.appendTo(tr[i]);
        }
    }
    for (var i = 0; i < length_types; i++) {
        var line = 0;
        for (index in ques_checked[id][types[i]]) {
            var input_group = $('<div class="input-group"></div>');
            input_group.appendTo(tr[line++].children().eq(i));
            var problem_id = $('<div class="input-group-addon" onmouseover="show_info(this)" type="' + types[i] + '">' + index + '</div>');
            problem_id.appendTo(input_group);
            var input_text = $('<input type="text" class="form-control" id="exampleInputAmount"><div class="input-group-addon">分</div>');
            input_text.appendTo(input_group);
        }
    }
    var last_submit = $('<button type="button" class="btn btn-lg btn-primary pull-right" onclick="last_submit()">提交</button>');
    last_submit.appendTo(div_question);
}

//重置函数
function reset() {
    for (var i = 0; i < length_types; i++) {
        problems[id][types[i]] = new Array();
    }
    if ($('table')[0] != undefined) {
        var count = $('input.check_question').length;
        for (var i = 0; i < count; i++) {
            $('input.check_question')[i].checked = false;
        }
    }
    $('button.btn-info')[0].innerHTML = "全选";
}

//统一分数函数
function unite(number) {
    var score_of_type = prompt("请输入此类题每道题所占分数：");
    if (score_of_type == null) return;
    else if (!isNaN(parseFloat(score_of_type))) {
        if (parseFloat(score_of_type) < 0 || parseFloat(score_of_type) > 100) {
            alert('输入的数字太大');
            return;
        }
        var tr_of = document.getElementsByTagName('tr');
        var count_tr = tr_of.length;
        for (var i = 2; i < count_tr; i++) {
            var td_of = tr_of[i].childNodes;
            if (td_of[number - 1].innerHTML == '') {
                break;
            }
            var input_of = td_of[number - 1].childNodes;
            input_of = input_of[0].childNodes;
            input_of[1].value = score_of_type;
        }
    } else {
        alert('输入的内容非法');
    }
}

//最后提交试卷
function last_submit() {
    var problems_checked = {};
    var tr_all = document.getElementsByTagName('tr');
    var length_tr = tr_all.length;
    for (var i = 0; i < length_types; i++) {
        var problems_type = {};
        var signal = 0;
        for (var j = 2; j < length_tr; j++) {
            var td_all = tr_all[j].childNodes;
            if (td_all[i].innerHTML == '') {
                if (j == 2) signal = 1;
                break;
            }
            var input_all = td_all[i].childNodes;
            input_all = input_all[0].childNodes;
            score_of_input = input_all[0].nextSibling.value;
            if (score_of_input == '') {
                show_error('请输入' + types_chinese[i] + '第' + (j - 1) + '道题的分数');
                return;
            }
            if (isNaN(score_of_input)) {
                show_error(types_chinese[i] + '第' + (j - 1) + '道题的分数输入非法');
                return;
            }
            problems_type[input_all[0].innerHTML] = input_all[0].nextSibling.value;
        }
        if (signal == 1) continue;
        switch (i) {
            case 0:
                problems_checked.J = problems_type;
                break;
            case 1:
                problems_checked.S = problems_type;
                break;
            case 2:
                problems_checked.M = problems_type;
                break;
            case 3:
                problems_checked.F = problems_type;
                break;
            case 4:
                problems_checked.W = problems_type;
                break;
            case 5:
                problems_checked.P = problems_type;
                break;
            default:
                show_error("length_types大小不对，last_submit()函数/469行");
        }
    }
    var score = 0;
    for (index in problems_checked) {
        for (inner in problems_checked[index]) {
            score += parseFloat(problems_checked[index][inner]);
        }
    }
    var con = prompt('总分为：' + score + '，确认提交吗？如果确认提交，请输入试卷标题：（示例：华南理工2016-2017年度C++期末考）');
    if (con == null) return;
    $.ajax({
        type: 'POST',
        url: './get_paper',
        data: {
            'subject': id,
            'title': con,
            'problems': problems_checked,
            'score': score
        },
        dataType: 'json',
        success: function(msg) {
            if (msg.status != 0) {
                show_error(msg.error);
                return;
            }
            alert('组卷成功，试卷ID为：' + msg.p_id);
        },
        error: function(xhr) {
            show_error('HTTP状态码为：' + xhr.status);
        }
    });
}

//编辑某道题目
function edit_question(obj) {
    if ($('table')[0] != undefined) {
        var count = $('input.check_question').length;
        for (var i = 0; i < count; i++) {
            var question_id = $('input.check_question')[i].parentNode.nextSibling.innerHTML;
            if ($('input.check_question')[i].checked) {
                problems[id][type][question_id] = 1;
            } else {
                problems[id][type][question_id] = 0;
            }
        }
    }
    var signal = 0;
    var question_id = obj.getAttribute('question_id');
    var question_type = obj.getAttribute('question_type');
    for (type_index in problems[id]) {
        for (questionid_index in problems[id][type_index]) {
            if (problems[id][type_index][questionid_index] == 1) {
                signal = 1;
                break;
            }
        }
        if (signal == 1) break;
    }
    if (signal == 1) {
        var make_sure = confirm('离开本页面去编辑题目，所勾选的题目将不会保存，确定离开吗？');
        if (make_sure == true) {
            window.open('./add_question?id=' + question_id + '&type=' + question_type, '_self');
        }
    } else window.open('./add_question?id=' + question_id + '&type=' + question_type, '_self');
}

//删除某道题目
function delete_question(obj) {
    var make_sure = confirm('确定删除此题？');
    if (make_sure == true) {
        var question_id = obj.getAttribute('question_id');
        var question_type = obj.getAttribute('question_type');
        $.ajax({
            type: 'POST',
            url: './delete_question',
            data: {
                'type': question_type,
                'id': question_id
            },
            dataType: 'json',
            success: function(data) {
                if (data.status != 0) show_error(data.error);
                else {
                    $('.' + question_type).trigger('click');
                }
            },
            error: function(xhr) {
                show_error('HTTP状态码为：' + xhr.status);
            }
        })
    }
}

//显示某道题目具体信息
function show_info(obj) {
    if ($('#show_info') != undefined) {
        $('#show_info').remove();
    }
    var type_of_info = obj.getAttribute('type');
    var id_type = obj.innerHTML;
    var show_info_ques = $('<div class="alert alert-info" id="show_info"></div>');
    show_info_ques.appendTo($('div.col-xs-1')[0]);
    $('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').appendTo(show_info_ques);
    $.ajax({
        type: 'POST',
        url: './ret_problem',
        data: {
            'type': type_of_info,
            'id': id_type
        },
        dataType: 'json',
        success: function(data) {
            if (data.status != 0) {
                show_error(data.error);
                return;
            }
            var content = data.content;
            var string_content = '<p><strong>id：</strong>' + id_type + '</p><p><strong title="科目id：' + content.subject.id + '">subject：</strong>' + content.subject.name + '</p><p><strong>chapter：</strong>' + content.chapter + '</p><p><strong title="教工id：' + content.teacher.id + '">teacher：</strong>' + content.teacher.name + '</p><p><strong>degree：</strong>' + content.degree + '</p>';
            if (type_of_info == 'J' || type_of_info == 'W') {
                string_content += '<p><strong>description：</strong>' + content.description + '</p><p><strong>answer：</strong>' + content.answer + '</p>';
            }
            if (type_of_info == 'S' || type_of_info == 'M') {
                string_content += '<p><strong>description：</strong>' + content.description + '</p>';
                for (var i = 0; i < content.number; i++) {
                    string_content += '<p><strong>' + letter[i] + '：</strong>' + content.items[letter[i]] + '</p>';
                }
                string_content += '<p><strong>answer：</strong>' + content.answer + '</p>';
            }
            if (type_of_info == 'F') {
                string_content += '<p><strong>description：</strong>' + content.description + '</p>';
                string_content += '<p><strong>answer：</strong>1：';
                if (typeof content.answer[0] == "string") {
                    string_content += '<u>' + content.answer[0] + '</u>';
                } else if (typeof content.answer[0] == "object") {
                    var length_answer = content.answer[0].length;
                    for (var i = 0; i < length_answer; i++) {
                        if (i != 0) string_content += '或';
                        string_content += '<u>' + content.answer[0][i] + '</u>';
                    }
                } else {
                    show_error('填空题的答案数据格式有误');
                    return;
                }
                string_content += '</p>';
                for (var i = 1; i < content.number; i++) {
                    string_content += '<p>&nbsp;2：';
                    if (typeof content.answer[i] == "string") {
                        string_content += '<u>' + content.answer[i] + '</u>';
                    } else if (typeof content.answer[i] == "object") {
                        var length_answer = content.answer[i].length;
                        for (var j = 0; j < length_answer; j++) {
                            if (j != 0) string_content += '或';
                            string_content += '<u>' + content.answer[i][j] + '</u>';
                        }
                    } else {
                        show_error('填空题的答案数据格式有误');
                        return;
                    }
                    string_content += '</p>';
                }
            }
            if (type_of_info == 'P') {
                string_content += '<p><strong>title</strong>' + content.title + '</p><p><strong>description：</strong>' + content.description + '</p><p><strong>输入描述：</strong>' + content.input + '</p><p><strong>输出描述：</strong>' + content.output + '</p><p><strong>输入样例：</strong>' + content.sample_input + '</p><p><strong>输出样例：</strong>' + content.sample_output + '</p><p><strong>关键字：</strong>' + content.keywords + '</p><p><strong>提示：</strong>' + content.hint + '</p><p><strong>time_limit：</strong>' + content.time_limit + 'S</p><p><strong>memory_limit：</strong>' + content.memory_limit + '</p><p><storng>degree：</strong>' + content.degree + '</p>';
            }
            $(string_content).appendTo(show_info_ques);
            $('strong').css('color', 'red');
        },
        error: function(xhr) {
            show_error('HTTP状态码为：' + xhr.status);
        }
    });
}

//显示所有错误信息
function show_error(msg) {
    var show_error_div = $('#show_error');
    if (show_error_div != undefined) {
        show_error_div.html('');
        var alert_div = $('<div id="show_warning" class="alert alert-warning"></div>');
        alert_div.appendTo(show_error_div);
        $('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').appendTo(alert_div);
        $('<strong>Error:</strong><div>' + msg + '</div>').appendTo(alert_div);
    }
}

//计算一个数组被赋值的元素个数
function length_array(array) {
    var number = 0;
    for (index in array) {
        number++;
    }
    return number;
}


//以下为闲置函数
function description_encode(str) {
    str = html_encode(str);
    alert(str);
    matchs = str.match(/&lt;img&nbsp;src=&quot;..\/img\/.*?px;&quot;&gt;/g);
    if (matchs != null) {
        length_matchs = matchs.length;
        for (var i = 0; i < length_matchs; i++) {
            alert(matchs[i]);
            matchs[i] = html_decode(matchs[i]);
            str = str.replace(/&lt;img&nbsp;src=&quot;..\/img\/.*?px;&quot;&gt;/, matchs[i]);
        }
    }
    return str;
}

function html_encode(str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\n/g, "</br>");
    return s;
}

function html_decode(str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&amp;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br>/g, "\n");
    return s;
}