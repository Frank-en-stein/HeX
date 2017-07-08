<?php
require_once "dbconnect.php";
require_once "utils.php";

$game_mode = 0;
$me = 1;
$gameid = -1;

if(isset($_GET['sse'])) {
    if(isset($_GET['gameid']) && $_GET['sse']=='joinGame') {
        $sql = "UPDATE matches SET state=0 WHERE id=?;";
        if ($stmt = $conn->prepare($sql)) {
            $tmp = test_input($_GET['gameid']);
            $stmt->bind_param("s", $tmp);
            $stmt->execute();

            $game_mode = 1;
            $me = 2;
            $gameid = test_input($_GET['gameid']);
        }
    }
    else if($_GET['sse']=='update' && isset($_GET['state'])) {

        if($_GET['state']=='waitingforplayer2' && isset($_GET['gameid'])) {
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            echo "data: ";

            $gameid = test_input($_GET['gameid']);
            $sql = "SELECT * FROM matches WHERE id=?;";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("s", $gameid);
                $stmt->execute();
                $res = $stmt->get_result();
                $row = $res->fetch_assoc();
                if($row['state']==0) {
                    echo 'player2joined';
                }
                else echo 'waitingforplayer2';
            }
            else echo 'error at database';

            echo "\n\n";
            flush();
            die;
        }
        else if($_GET['state']=='update_board' && isset($_GET['gameid'])) {
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            echo "data: ";

            $gameid = test_input($_GET['gameid']);
            $sql = "SELECT * FROM board WHERE match_id=? ORDER BY step DESC LIMIT 1;";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("s", $gameid);
                $stmt->execute();
                $res = $stmt->get_result();
                $row = $res->fetch_assoc();

                $json = array('move_count' => $row['step'], 'move' => $row['board_params']);

                echo json_encode($json);

            }
            else echo 'error at database';

            echo "\n\n";
            flush();
            die;
        }
        else if($_GET['state']=='send' && isset($_GET['gameid'])) {
            $gameid = test_input($_GET['gameid']);
            $move_count = test_input($_POST['move_count']);
            $move = test_input($_POST['move']);

            $sql = "INSERT INTO board(match_id, step, board_params) VALUES(?,?,?);";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("sss", $gameid, $move_count, $move);
                $stmt->execute();
                die(true);
            }
            else die(false);
        }
    }
}
else if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    if(isset($_POST['sse']) && $_POST['sse'] = 'newGame') {
        $sql = "INSERT INTO matches() VALUES();";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->execute();
            $gameid = $stmt->insert_id;
            echo $_SERVER['HTTP_HOST'] . "/hex/index.php?sse=joinGame&gameid=" . $stmt->insert_id ;
            die;
        }
        else die('error');
    }
}
?>
<!doctype html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>HeX</title>
    <script src="//cdn.jsdelivr.net/phaser/2.5.0/phaser.min.js"></script>
    <script src="jquery-1.11.1.min.js"></script>
    <link rel="stylesheet" href="style.css" type="text/css">
</head>
<body>
<!-- Trigger/Open The Modal -->
<button id="myBtn" hidden="hidden">Open Modal</button>

<!-- The Modal -->
<div id="myModal" class="modal">

    <!-- Modal content -->
    <div class="modal-content">
        <span class="close">&times;</span>
        <p id="modal-msg">Some text in the Modal..</p>
        <button id="copy-link">Copy Link</button>
        <p id="copied"></p>
    </div>

</div>

<script>
    <?php
    echo "var game_mode = $game_mode; var me = $me; var gameid=$gameid;"  //0->offline multiplayer, 1->online multiplayer, 2->bot;
    ?>
</script>
<script type="text/javascript" src="script.js"></script>

</body>
</html>