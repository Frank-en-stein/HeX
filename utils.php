<?php
/**
 * Created by PhpStorm.
 * User: avash
 * Date: 1/24/17
 * Time: 1:50 AM
 */

$salt = '-45dfeHK/__yu349@-/klF21-1_\/4JkUP/4';

function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function stripsalt($id) {
    $regType = explode('_', $id);
    $id = $regType[1];
    $regType = $regType[0];
    $id = (int)base_convert($id, 36, 10);
    return (((0x0000FFFF & $id) << 16) + ((0xFFFF0000 & $id) >> 16));
}

function addsalt($id, $regType) {
    $id = (int)$id;
    $id = (((0x0000FFFF & $id) << 16) + ((0xFFFF0000 & $id) >> 16));
    $id = base_convert($id, 10, 36);
    $id = str_pad($id,7,"0",STR_PAD_LEFT);
    return $regType.'_'.$id;
}

function registrationType($id) {
    return explode('_', $id)[0];
}
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
?>