
<?php
	header('Content-type:text/json;charset=utf-8');
    /*$type=$_POST['type'];
	$description=$_POST['description'];
	$subject=$_POST['subject'];
	$chapter=$_POST['chapter'];*/
	//$num=$_POST['number'];
	//$A=$_POST['items']['A'];
	//$B=$_POST['items']['B'];
	//$f1=$_POST['answer']['1'];
	//$f2=$_POST['answer']['2'];
	//$f12=$_POST['answer']['1']['2'];
	//$tmp = str_replace("<br>",'\r',$hosts); 
	
	$a = array(
		'status'=>0,
		'subject'=>array(
			array('id'=>1,'name'=>'C++中文','one'=>7,'two'=>8),
			array('id'=>2,'name'=>'C++英文','one'=>5,'two'=>6),
		),
		'answer'=>'F',
	);
	/*$b = $_POST['quest'];
	$barr = json_decode($b);
	echo $barr;*/
   //$data='{type:"' . $type . '",description:"' . $description .'",subject:"'.$subject.'",chapter:"'.$chapter.'",type:"'.$type.'"}';
   //,number:"'.$num.'",12:"'.$f12.'",2:"'.$f2.'"
   // $data= {'username':'user','password':'pass'};
    //$str=json_encode($data);
  //  $json={"name":"yovae","password":"12345"}; 
    echo json_encode($a);
    //echo $data;
?>
