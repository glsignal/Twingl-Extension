Annotator.Plugin.Twinglings = function (element, options) {
  Annotator.Plugin.apply(this, arguments)
}

jQuery.extend(Annotator.Plugin.Twinglings.prototype, new Annotator.Plugin(), {
  events: {
    "#twinglings click": "twinglIt"
  },
  options: {},
  pluginInit: function() {
    var that = this; 
    console.log("Plugin successfully initialised.", this);
    
    modifyTwingling.annotator = this.annotator;
    annotatorMethods.annotatorObject = this.annotator;
    
    $(".annotator-controls").prepend("<a id='twinglings' href='#twingling'>Twinglings</a>");
    
    // Subscribe to events
    this.annotator
      .subscribe("annotationEditorShown", function(editor, annotation) {
        that.currentAnnotation = annotation;
      })
      .subscribe("annotationDeleted", function(annotation) {
        updateHighlightList.remove(annotation);
      })
      .subscribe("annotationCreated", function(annotation) {
        annotation.twinglings = []; // Prevent twinglings.length error on fresh Annotations.
      })
      .subscribe("annotationCreatedSuccess", function(annotation) {
        console.log("Great success! Annotation created with ID" + annotation.id)
        updateHighlightList.add(annotation);
      })
      .subscribe("twinglingCreated", function(twingling, annotation) {
        annotation.twinglings.push(twingling);
        if (twingling.end_object.context_url === annotation.context_url) {
          console.log("YO! You be making a same page Twingling!")
          /* We then need to find its local annotation object—the one which Annotator is holding
          in memory—and push a Twingling to that array. We need to do the same on delete. 
          This is a time consuming and medium priority task. */
        }
      })
      .subscribe("twinglingDestroyed", function(twingling, annotation) {
        for (var i = annotation.twinglings.length - 1; i >= 0; i--) {
          if (annotation.twinglings[i].id === twingling.id) {
            annotation.twinglings.splice(i, 1);
            return
          }
        };
      });
    // End Subscribe Chain
    
    /* Add Twinglings to the Tooltip */
    this.annotator.viewer.addField({
      load: function(field, annotation) {
        // Check if a Twingling is Inbound or Outbound, then append it to the list. 
        for (var i = annotation.twinglings.length - 1; i >= 0; i--) {
          if (annotation.twinglings[i].start_id === annotation.id) {
            var twingling = annotation.twinglings[i].end_object;  
          } else {
            var twingling = annotation.twinglings[i].start_object;
          };
          twingling.quote = twingling.quote.substr(0, 125) + "&#8230";
          twingling.shortURL = getHostname(twingling.context_url);
          $(field).append("<a class='twingling' href='" + twingling.context_url + "'>" + twingling.quote + "<br><small>"+ twingling.shortURL +"</small> </a>");
        };
      }
    });
  },
  twinglIt: function(event) {
    Annotator.Util.preventEventDefault(event);
    console.log(this);
    this.annotator.editor.submit();
    if(this.currentAnnotation.id == undefined) {
      console.log("No id yet.")
     /* If an ID has not yet been received...
        We want to init the Synapser, but have it stay in the "working"
        state until annotationCreatedSuccess has been heard. 
        Then it can proceed as normal.
      */ 

    } else {
      initSynapser(this.currentAnnotation);
    }
  }
});
