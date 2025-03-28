<?php defined("ABSPATH") || die("!"); ?>
<p>
    Please BackUp Your Database before using this feature
</p>
<p>
    This Chapter List is Already Sorted (DESC) by Default, You Can Rearrange Each Chapter order by Drag and Drop it.
</p>
<p>
    This feature will change post date of every chapter bellow
</p>
<p>
    Note: Latest Chapter must be on Top
</p>
<ul id="sortable" width="100%">
<?php foreach($chapters['chapterKeys'] as $k => $v) { 
        $v = $chapters['object'][$v]; ?>
    <li class="ui-state-default">
        <?php echo $v->ID?> |
        <b style="color:red"><?php echo esc_html($v->chapter) ?></b> <i class="hide">|</i>
        <x class="ts"></x> | 
        <y class="desc"><?php echo esc_html($v->post_title);?></y>
    </li>
<?php } ?>
</ul>
<?php if ($hasChapter) { ?>
<button onclick="saveMeNow(this);">SAVE</button><span id="working">Updating: <w id="w">0</w>/<?php echo sizeof($chapters["object"]); ?></span>
<?php } else { ?>
NO CHAPTER
<?php } ?>
<script>
    $( function() {
    $( "#sortable" ).sortable({
        update: function( ) {
            generateDates();
        },
        
    });
    $( "#sortable" ).disableSelection();
    
    } );
</script>
<script>
    var theDates = <?php echo json_encode($chapters['dates']); ?>;
    function generateDates(){
        $(document).find("li.ui-state-default").each(function(k,v){
            var html = $(this).html();
            html = html.replace(/<x class="ts">.*?<\/x>/, `<x class="ts">`+new Date(theDates[k]*1000)+`</x>`);
            $(this).html(html);
        });
    }
    generateDates();
    function getJsonFromHTML(){
        var li = jQuery('#sortable li');
        var res = [];
        var allOK = true;
        li.each(function(k,v){
            if (allOK === false) return true;
            var theData = v.innerText.split(" | ");
            var tmp = {};
            tmp.id = theData[0].trim();
            if (isNaN(tmp.id)) {
                allOK = false;
                return true;
            }
            tmp.date = theDates[k];
            if (isNaN(tmp.date)) {
                allOK = false;
                return true;
            }
            tmp.num = theData[1].trim();
            if (tmp.num.length < 1) {
                allOK = false;
                return true;
            }
            res.push(tmp);
        });
        if (allOK == false) return false;
        return res;
    }
    function saveChanges(index, cb){
        var json = getJsonFromHTML();
        if (json == false){
            alert("Data is malformed");
            return false;
        }
        if (isNaN(index)) index = 0;
        if (index >= json.length) return cb();
        var item = json[index];
        $.post("?act=update&skey=<?php echo $skey; ?>&ukey=<?php echo $ukey;?>&access_token=<?php echo $access_token; ?>", item)
        .always(function(){
            $("#w").html(index+1);
            $("#working").show();
            saveChanges(index+1, cb);
        });
    }
    function saveMeNow(){
        if ( ! confirm("Are you sure?")) return false;
        saveChanges(0, function(){
            $.post("?act=done&skey=<?php echo $skey; ?>&ukey=<?php echo $ukey;?>&access_token=<?php echo $access_token; ?>", {
                "mid": <?php echo $mangaID; ?>,
            })
            .always(function(){
               alert("DONE");
            });
        });
    }
    
</script>