guard 'shell' do
  watch(/^sass\/(.*)\.s[a,c]ss/){|m| `compass compile` }
end

guard 'livereload', :api_version => '1.5' do
  watch(/.+\.(css|js|html|png|jpg|gif)$/)
end
