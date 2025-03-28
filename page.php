<?php 
defined("ABSPATH") || die("!");
if(current_user_can('administrator') == FALSE) {  
    ts_resview_show_msg(["error" => "NO, YOU CAN'T DO THIS"]);
}
GOV_do_reset::gdre_listen();
$post_list = GOV_do_reset::gdre_getAll();
?>
<html>
    <head>
        <title>View Reset</title>
    </head>
    <body>
		Processing: <span id="processsed">0</span>/<?php echo sizeof($post_list);?><br />
		<div id="info"></div>

		<script>
			var post = <?php echo json_encode($post_list); ?>;
			function up(){
				var n = document.getElementById("processsed").innerText;
				n = 1 + parseInt(n);
				document.getElementById("processsed").innerHTML = n;
			}
			function doone(cb){
				if (post.length < 1) return cb();
				var item = post.shift();
				up();
				fetch("?<?php echo TS_VIEW_RESET_NONCE; ?>=do&id="+item+"&access_token=<?php echo TS_VIEW_RESET_ACCESS_NONCE; ?>").then(function(response) {
					if(response.ok) {
						return response.json();
					}
					document.getElementById("info").innerHTML = 'Network response was not ok.';
					return {error: "Network response was not ok."};
					
				}).then(function(json) { 
					if (json.error != 0){
						document.getElementById("info").innerHTML = "Error: " + json.error;
					}else{
						document.getElementById("info").innerHTML = json.data;
					}
					setTimeout(function(){
						doone(cb);
					}, 100);
				}).catch(function(error) {
					document.getElementById("info").innerHTML = 'There has been a problem with your fetch operation: ' + error.message;
				});
			}
			doone(function(){
				if (post.length > 0) alert("DONE");
				else alert('No Post Found');
			});
		</script>
    </body>
</html>