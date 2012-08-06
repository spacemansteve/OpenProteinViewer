<?php
	//return the alignment txt file from "matt.cs.tufts.edu" server
	$id = $_GET["id"];
	$txtFile = "http://matt.cs.tufts.edu/results/$id/alignment.txt";
	$refreshUrl = "display.php?id=$id";
	while(!$fp=@fopen($txtFile,"r")){
		sleep(1);
	}	
	$result = "<div><div id ='outputTxt'>";
	$result .= @stream_get_contents($fp);
	fclose($fp);
	$pdbFile = "http://matt.cs.tufts.edu/results/$id/alignment.pdb";
	If(!$fpdb=@fopen($pdbFile,"r")){
		$result .= "</div></div>";
	}else{
		$result .= "</div><div id='outputPdb'>";
		$result .= @stream_get_contents($fpdb);
		$result .= "</div></div>";
		fclose($fpdb);
	}	
	echo $result;
?>