<?php defined("ABSPATH") || die("!"); ?>
<html>
    <head>
        <title>Chapter Sorter - <?php echo get_bloginfo("name"); ?></title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        <style>
            #sortable { list-style-type: none; margin: 0; padding: 0; width: 100%; }
            #sortable li {cursor: move;margin: 0 3px 3px 3px; padding: 0.4em; padding-left: 1.5em; font-size: 1.4em; height: 18px; border:1px solid #ddd;}
            #sortable li span { position: absolute; margin-left: -1.3em; }
			#preview, iframe{
				width:100%;
				height:300px;
			}
			.ts, #working, .hide{
				display:none;
			}
        </style>
    </head>
    <body>
	<a href="<?php echo get_site_url(); ?>/wp-admin/">Dashboard</a>
	<a href="?access_token=<?php echo $access_token; ?>&new=1">New Task</a>
    <?php 
    if (is_object($mangaData) && $mangaData && is_numeric($mangaID) && $mangaID) { ?>
		<?php include(__DIR__ . "/list.php"); ?>
    <?php } else { ?>
		<?php include(__DIR__ . "/init.php"); ?>
    <?php } ?>
    </body>
</html>