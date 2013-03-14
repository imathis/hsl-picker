require 'stitch-rb'
require 'uglifier'
require 'coffee-script'

guard 'coffeescript', :input => 'coffeescripts', :output => 'javascripts'

guard :compass do
  watch(%r{^assets/stylesheets/(.*)\.s[ac]ss$})
end

guard :shell do
  watch /^assets\/javascripts\/.+\.(js|coffee)/ do |change|
    file = "javascripts/hslpicker.js"
    env = 'production'

    lib = ['underscore.js', 'backbone.js', 'dragdealer.js'].collect {|item| Dir.glob("assets/javascripts/lib/#{item}") }.flatten.uniq
    modules = Dir.glob('assets/javascripts/modules/*.*')
    fingerprint = Digest::MD5.hexdigest((lib|modules).map! { |path| "#{File.mtime(path).to_i}" }.join+env)

    if File.exists?(file) and File.open(file) {|f| f.readline} =~ /#{fingerprint}/
      false
    else
      js = Stitch::Package.new(:paths => 'assets/javascripts/modules', :dependencies => lib).compile
      js = Uglifier.new.compile(js) if env == 'production'
      js = "/* fingerprint: #{fingerprint} */\n" + js

      begin
        File.open(file, 'w') { |f| f.write js }
      rescue => e
        puts e.message, e.backtrace
        exit(-1)
      end
      puts "Generated #{file}"
    end
  end
end
