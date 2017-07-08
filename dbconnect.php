<?php
/**
 * Created by PhpStorm.
 * User: avash
 * Date: 1/21/17
 * Time: 2:54 AM
 */

$servername = "localhost";
$username='';
$password='';
$dbname='';
if($_SERVER['SERVER_ADDR']!='127.0.0.1' && $_SERVER['SERVER_ADDR']!="::1" && substr($_SERVER['SERVER_ADDR'],0,7)!='192.168') {
    $username = "mistroboticsclub_root";
    $password = "201414107avash";
    $dbname = "mistroboticsclub_hex_game_db";
}
else {
    $username = "root";
    $password = "";
    $dbname = "hex_game_db";
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection

if ($conn->connect_error) {
    die("Database error: " . $conn->error);
}
//else echo "success";

$link = mysqli_connect($servername, $username, $password, $dbname);

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}

?>
