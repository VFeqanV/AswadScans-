<?php 
defined("ABSPATH") || die("!");
if(current_user_can('administrator') == FALSE) {  
    ts_resview_show_msg(["error" => "NO, YOU CAN'T DO THIS"]);
}
?>

<html>
    <head>
        <title>View Reset</title>
    </head>
    <body>
        <?php if (isset($_GET[TS_VIEW_RESET_RUN_NONCE]) && ! isset($_GET[TS_VIEW_RESET_PT_NONCE])) { ?>
        <p><b style="color:red">Please select at least one post type</b></p>
        <?php } ?>
        <p><b>You Must BACKUP your DATABASE before using this tool</b></p>
        <p><b>Use this feature at your own Risk.</b></p>
        <p><b>Select Which Post Types You Want To Reset:</b></p>
        <form action="" method="GET" id="fm">
            <input type="hidden" name="access_token" value="<?php echo TS_VIEW_RESET_ACCESS_NONCE; ?>" />
            <input type="checkbox" id="manga" name="<?php echo TS_VIEW_RESET_PT_NONCE;?>[]" checked value="manga"/> <label for="manga">Manga</label>
            <br />
            <input type="checkbox" id="chapter" name="<?php echo TS_VIEW_RESET_PT_NONCE;?>[]" value="post"/> <label for="chapter">Chapter</label> 
            <br />
            <br />
            <input type="submit" name="<?php echo TS_VIEW_RESET_RUN_NONCE; ?>" value="Start" />
        </form>
        <script>
            var fm = document.querySelector("#fm");
            fm.onsubmit = function(){
                var checkedBoxes = document.querySelectorAll('input:checked');
                if (checkedBoxes.length < 1) {
                    alert('Please select at least one post type');
                    return false;
                }
                if ( ! confirm('It is encouraged to backup your database before using this tool, want to continue?')) return false;
            }
        </script> 
    </body>
</html>