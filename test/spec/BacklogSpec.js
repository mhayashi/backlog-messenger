describe("backlog.js", function() {
  describe("backlog.getUser", function() {
    it("should return the specified user", function() {
      runs(function() {
        var lib = backlog({
          space: 'demo',
          username: 'demo',
          password: 'demo'
        });
        this.user = null;
        var that = this;

        this.proj = null;
        this.proj = lib.getProjects();
        // lib.getUser(function(result) {
        //   that.user = result;
        // });
        expect(this.proj).toEqual(null);
      });

      waits(2000);

      runs(function() {
        console.log(this.proj);
        expect(this.proj).toEqual({});
      });
    });
  });
});
