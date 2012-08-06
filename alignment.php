<?php
	//set up variables
	$theData = "pdbs=";
	// pdbs equeals to the names of the protein we are going to align
	$theData .= strtolower($_POST["pdbs"]);
	$theData .= "&rename=rename";
	$url="http://matt.cs.tufts.edu/control.php";
	//do post request to "matt.cs.tufts.edu/control.php" and get the response header
	function do_post_request($url, $theData, $optional_headers = null){
		$params = array('http'=>array('method'=>'POST','content'=>$theData,'max_redirects'=>'0'));
		if($optional_headers !== null){
			$params['http']['header'] = $optional_headers;
		}
		$ctx = stream_context_create($params);
		$fp = @fopen($url,'rb',false,$ctx);
		return $http_response_header;
	}
	
	//parse the response header get from the post request
	//then get the redirect url
	function getNextLocation($headers) 
	{ 
		$array = $headers; 
		$count = count($array); 

		for ($i=0; $i < $count; $i++) 
		{ 
			if (strpos($array[$i], "ocation:")) 
			{ 
                $url = substr($array[$i], 10); 
			} 
		} 
		if ($url) 
		{ 
			return $url; 
		} 
		else 
		{ 
			return 0; 
		} 
	} 
	//after we get the redirect url, we do a get request
	function do_get_request($url, $theData, $optional_headers = null){
		$params = array('http'=>array('method'=>'GET','max_redirects'=>'0'));
		if($optional_headers !== null){
			$params['http']['header'] = $optional_headers;
		}
		
		header("Location: $url");
		$ctx = stream_context_create($params);
		$fp = @fopen($url,'rb',false,$ctx);
	
		if(!$fp){
			throw new Exception("Problem with $rul, $php_errormsg");
		}
		$response = @stream_get_contents($fp);
		if($response === false){
			throw new Exception("Problem reading data from $url, $php_errormsg");
		}
		fclose($fp);
	}
	
	$responseHeader = do_post_request($url,$theData,null);
	$newurl = getNextLocation($responseHeader);
	$pos = strpos($newurl, "?id=");
	if($pos === false ){
		
	}else{
		global $id;
		$id = substr($newurl, $pos+4);
	}
	
	$newurl = "http://matt.cs.tufts.edu" . $newurl;
	
	//redirect to display page and with the unique id
	header('Location:/glmol_tuftsViewer/display.php?id='.$id);
?>