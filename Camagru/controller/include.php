<?php
	session_start();
	require_once('config/database.php');
	require_once('config/setup.php');
	require_once('controller/auth.php');
	require_once('controller/signin.php');
	require_once('controller/signup.php');
	require_once('controller/signout.php');
	require_once('controller/save.php');
	require_once('controller/pics.php');
	require_once('controller/mypics.php');
	require_once('controller/delpic.php');
	require_once('controller/reset.php');
	require_once('controller/getlike.php');
	require_once('controller/like.php');
	require_once('controller/comments.php');
?>
